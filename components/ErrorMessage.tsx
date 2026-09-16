import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message = "데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." }: { message?: string }) {
  return <div className="error-message"><AlertCircle size={20} />{message}</div>;
}
