export default function VoucherDescription({ html }: { html: string }) {
  return (
    <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: html }}></p>
  );
}
