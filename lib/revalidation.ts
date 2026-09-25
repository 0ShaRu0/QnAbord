import "server-only";
import { revalidatePath } from "next/cache";

export function revalidateQuestions(questionId?: string) {
  revalidatePath("/");
  revalidatePath("/questions");
  if (questionId) {
    revalidatePath(`/questions/${questionId}`);
    revalidatePath(`/questions/${questionId}/edit`);
  }
}
