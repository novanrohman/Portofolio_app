import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import CvDocument from "@/app/cv/CvDocument";
import { getCvData } from "@/lib/cvData";
import { getLocale } from "@/lib/i18n";

export const runtime = "nodejs";

export async function GET() {
  const locale = await getLocale();
  const data = await getCvData(locale);

  const element = createElement(CvDocument, { data }) as unknown as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(element);
  const safeName = (data.profile.name ?? "cv").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="CV-${safeName || "resume"}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
