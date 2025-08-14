import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import crypto from "crypto";

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
    include: {
      links: {
        where: { isActive: true },
        orderBy: { position: "asc" },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
            {qrCode.title || "My Links"}
          </h1>

          {qrCode.links.length === 0 ? (
            <p className="text-center text-gray-500">No links available yet.</p>
          ) : (
            <div className="space-y-4">
              {qrCode.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-center"
                >
                  <span className="text-gray-800 font-medium">
                    {link.title}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-white text-sm mt-8">
          Powered by PlanoDigital
        </p>
      </div>
    </div>
  );
}
