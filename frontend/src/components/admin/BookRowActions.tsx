"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStockAction, deleteBookAction, StockFormState } from "@/app/admin/books/actions";
import { useConfirm } from "@/components/ConfirmDialogProvider";

const initialState: StockFormState = { success: false, message: "" };

export default function BookRowActions({ bookId, stock }: { bookId: string; stock: number }) {
  const [state, formAction] = useActionState(updateStockAction, initialState);
  const [isDeleting, startDelete] = useTransition();
  const router = useRouter();
  const confirm = useConfirm();

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Remove this book?",
      message: "Remove this book from the catalog? This can't be undone.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!confirmed) return;
    startDelete(async () => {
      await deleteBookAction(bookId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center flex-wrap gap-3">
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={bookId} />
        <input
          type="number"
          name="stock"
          min={0}
          defaultValue={stock}
          className="w-20 bg-[#111] border border-gray-700 rounded-md py-1.5 px-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
        />
        <button
          type="submit"
          className="text-xs font-medium px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded transition-colors"
        >
          Update
        </button>
      </form>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-xs font-medium px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-100 rounded border border-red-800 transition-colors disabled:opacity-60"
      >
        {isDeleting ? "Removing..." : "Delete"}
      </button>

      {state.message && (
        <span className={`text-xs ${state.success ? "text-green-400" : "text-red-400"}`}>{state.message}</span>
      )}
    </div>
  );
}
