import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import crypto from "crypto";
import { ThemeRenderer } from "@/components/themes/ThemeRenderer";
import { SocialLink } from "@/types/design";
import { getDesignFieldsSelect, mapQRCodeToDesignSettings } from "@/lib/design/fields";

interface PageProps {
  params: Promise<{
    shortCode: string;
  }>;
}

export default async function LinkPage({ params }: PageProps) {
  const { shortCode } = await params;

  const qrCode = await prisma.qRCode.findUnique({
    where: {
      shortCode,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      redirectType: true,
      redirectUrl: true,
      // Design fields - automatically synced with DesignSettings
      ...getDesignFieldsSelect(),
      links: {
        where: { isActive: true },
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          url: true,
          position: true,
          isActive: true,
        },
      },
    },
  });

  if (!qrCode) {
    notFound();
  }

  // Track the scan
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || undefined;
  const ipHeader =
    headersList.get("x-forwarded-for") || headersList.get("x-real-ip");
  const ipHash = ipHeader
    ? crypto.createHash("sha256").update(ipHeader).digest("hex")
    : undefined;
  const referer = headersList.get("referer") || undefined;

  await prisma.scan
    .create({
      data: {
        qrCodeId: qrCode.id,
        userAgent,
        ipHash,
        referer,
      },
    })
    .catch(console.error); // Don't block the redirect if tracking fails

  // Handle redirect based on type
  if (qrCode.redirectType === "url" && qrCode.redirectUrl) {
    redirect(qrCode.redirectUrl);
  }

  // Create design settings object - automatically synced with DesignSettings interface
  const designSettings = mapQRCodeToDesignSettings(qrCode);

  return (
    <ThemeRenderer
      design={designSettings}
      title={qrCode.title}
      description={qrCode.description}
      avatarUrl={qrCode.avatarUrl}
      links={qrCode.links}
      socialLinks={qrCode.socialLinks as SocialLink[] | null}
    />
  );
}
