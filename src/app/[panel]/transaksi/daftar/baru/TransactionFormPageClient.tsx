"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { swalError, swalSuccess } from "@/lib/swal";
import type { TransactionPriority } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PRIORITY_LABELS } from "@/lib/transaction-status";
import { createTransactionAction } from "@/lib/actions/service-transactions";

interface ServicePackageOption {
  id: string;
  name: string;
  price: number;
  estimatedDurationLabel: string | null;
}

interface ServiceOption {
  id: string;
  title: string;
  basePrice: number | null;
  estimatedDurationLabel: string | null;
  packages: ServicePackageOption[];
}

const NONE = "__none__";

export default function TransactionFormPageClient({
  services,
  staff,
  panel,
}: {
  services: ServiceOption[];
  staff: { id: string; name: string; role: string }[];
  panel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [packageId, setPackageId] = useState<string>(NONE);
  const [assignedStaffId, setAssignedStaffId] = useState<string>(NONE);
  const [priority, setPriority] = useState<TransactionPriority>("NORMAL");
  const [startDate, setStartDate] = useState("");
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState("");
  const [totalPrice, setTotalPrice] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [internalNotes, setInternalNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const selectedService = services.find((s) => s.id === serviceId) ?? null;
  const selectedPackage = selectedService?.packages.find((p) => p.id === packageId) ?? null;

  const grandTotal = useMemo(() => {
    const t = Number(totalPrice) || 0;
    const d = Number(discount) || 0;
    const tx = Number(tax) || 0;
    return t - d + tx;
  }, [totalPrice, discount, tax]);

  const applyServiceDefaults = (id: string) => {
    setServiceId(id);
    setPackageId(NONE);
    const svc = services.find((s) => s.id === id);
    if (svc?.basePrice) setTotalPrice(String(svc.basePrice));
  };

  const applyPackageDefaults = (id: string) => {
    setPackageId(id);
    if (id === NONE) return;
    const pkg = selectedService?.packages.find((p) => p.id === id);
    if (pkg) setTotalPrice(String(pkg.price));
  };

  const submit = () => {
    if (customerName.trim().length < 3) return swalError("Nama customer minimal 3 karakter");
    if (!/^\S+@\S+\.\S+$/.test(customerEmail)) return swalError("Format email tidak valid");
    if (customerPhone.trim().length < 9) return swalError("Nomor telepon minimal 9 digit");
    if (!serviceId) return swalError("Layanan wajib dipilih");

    startTransition(async () => {
      const res = await createTransactionAction({
        customerName,
        customerEmail,
        customerPhone,
        customerCompany: customerCompany.trim() || null,
        serviceId,
        packageId: packageId === NONE ? null : packageId,
        assignedStaffId: assignedStaffId === NONE ? null : assignedStaffId,
        priority,
        startDate: startDate || null,
        estimatedCompletionDate: estimatedCompletionDate || null,
        totalPrice: Number(totalPrice) || 0,
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        internalNotes: internalNotes.trim() || null,
        customerNotes: customerNotes.trim() || null,
      });
      if (res.ok) {
        swalSuccess("Transaksi berhasil dibuat");
        router.push(`/${panel}/transaksi/daftar/${res.id}`);
      } else {
        swalError(res.message);
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/${panel}/transaksi/daftar`}
          className="flex size-9 items-center justify-center rounded-xl border border-admin-line text-gray-500 hover:text-primary hover:border-primary/40"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Transaksi Baru</h1>
      </div>

      <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Informasi Customer</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Nama Customer</Label>
            <Input className="mt-1.5 rounded-lg" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Email</Label>
            <Input type="email" className="mt-1.5 rounded-lg" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">No. WhatsApp</Label>
            <Input className="mt-1.5 rounded-lg" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Perusahaan <span className="font-normal text-gray-400">(opsional)</span></Label>
            <Input className="mt-1.5 rounded-lg" value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Layanan & Paket</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Layanan</Label>
            <Select items={Object.fromEntries(services.map((s) => [s.id, s.title]))} value={serviceId} onValueChange={(v) => v && applyServiceDefaults(v)}>
              <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} align="start">
                {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedService?.estimatedDurationLabel && (
              <p className="mt-1 text-xs text-gray-400">Estimasi: {selectedService.estimatedDurationLabel}</p>
            )}
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Paket <span className="font-normal text-gray-400">(opsional)</span></Label>
            <Select
              items={{ [NONE]: "Tanpa paket", ...Object.fromEntries((selectedService?.packages ?? []).map((p) => [p.id, p.name])) }}
              value={packageId}
              onValueChange={(v) => v && applyPackageDefaults(v)}
            >
              <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} align="start">
                <SelectItem value={NONE}>Tanpa paket</SelectItem>
                {(selectedService?.packages ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — Rp{p.price.toLocaleString("id-ID")}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedPackage?.estimatedDurationLabel && (
              <p className="mt-1 text-xs text-gray-400">Estimasi: {selectedPackage.estimatedDurationLabel}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Penugasan, Prioritas & Jadwal</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Staff Ditugaskan <span className="font-normal text-gray-400">(opsional)</span></Label>
            <Select
              items={{ [NONE]: "Belum ditugaskan", ...Object.fromEntries(staff.map((u) => [u.id, u.name])) }}
              value={assignedStaffId}
              onValueChange={(v) => v && setAssignedStaffId(v)}
            >
              <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} align="start">
                <SelectItem value={NONE}>Belum ditugaskan</SelectItem>
                {staff.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Prioritas</Label>
            <Select items={PRIORITY_LABELS} value={priority} onValueChange={(v) => v && setPriority(v as TransactionPriority)}>
              <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} align="start">
                {Object.entries(PRIORITY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Tanggal Mulai <span className="font-normal text-gray-400">(opsional)</span></Label>
            <Input type="date" className="mt-1.5 rounded-lg" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Estimasi Selesai <span className="font-normal text-gray-400">(opsional)</span></Label>
            <Input type="date" className="mt-1.5 rounded-lg" value={estimatedCompletionDate} onChange={(e) => setEstimatedCompletionDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Harga</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Harga Total</Label>
            <Input type="number" min={0} className="mt-1.5 rounded-lg" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Diskon</Label>
            <Input type="number" min={0} className="mt-1.5 rounded-lg" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Pajak</Label>
            <Input type="number" min={0} className="mt-1.5 rounded-lg" value={tax} onChange={(e) => setTax(e.target.value)} />
          </div>
        </div>
        <div className="rounded-xl bg-primary/5 px-4 py-3 text-right">
          <span className="text-xs text-gray-500">Grand Total: </span>
          <span className="text-lg font-extrabold text-primary">Rp{grandTotal.toLocaleString("id-ID")}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-admin-line p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Catatan</h3>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Catatan Internal <span className="font-normal text-gray-400">(gak keliatan customer)</span></Label>
          <Textarea rows={2} className="mt-1.5 rounded-lg resize-none" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Catatan untuk Customer <span className="font-normal text-gray-400">(opsional)</span></Label>
          <Textarea rows={2} className="mt-1.5 rounded-lg resize-none" value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} />
        </div>
      </div>

      <Button className="gap-2 rounded-xl" onClick={submit} disabled={isPending}>
        <Save size={15} />
        {isPending ? "Menyimpan..." : "Buat Transaksi"}
      </Button>
    </div>
  );
}
