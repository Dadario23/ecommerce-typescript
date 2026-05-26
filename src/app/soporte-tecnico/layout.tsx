import SoporteNavbar from "@/components/SoporteNavbar";

export default function SoporteTecnicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoporteNavbar />
      {children}
    </>
  );
}
