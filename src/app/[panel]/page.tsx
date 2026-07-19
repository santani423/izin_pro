import { redirect } from "next/navigation";

/* /admin, /editor, /author (bare) -> lempar ke dashboard panel-nya */
export default async function PanelIndexPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  redirect(`/${panel}/dashboard`);
}
