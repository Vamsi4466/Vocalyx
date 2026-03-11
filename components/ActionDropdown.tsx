"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import { BookCardProps } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { deleteBookWithRelations, renameBook } from "@/lib/actions/book.actions";
// import { renameBook, deleteBookWithRelations } from "@/lib/actions/book.actions";

interface ActionItem {
  label: string;
  value: "rename" | "delete";
  icon: string;
}

const actionItems: ActionItem[] = [
  { label: "Rename", value: "rename", icon: "/assets/icons/rename.svg" },
  { label: "Delete", value: "delete", icon: "/assets/icons/delete.svg" },
];

const ActionDropdown = ({ book }: { book: BookCardProps & { bookId: string } }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionItem | null>(null);
  const [title, setTitle] = useState(book.title);
  const [isLoading, setIsLoading] = useState(false);

  const path = usePathname();

  const closeModal = () => {
    setIsModalOpen(false);
    setAction(null);
    setTitle(book.title);
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);

    try {
      if (action.value === "rename") {
        await renameBook({ bookId: book.$id, newTitle: title, path });
      } else if (action.value === "delete") {
        await deleteBookWithRelations({ bookId: book.$id, path });
      }
      closeModal();
    } catch (error) {
      console.error("Action failed:", error);
    }

    setIsLoading(false);
  };

  const renderDialogContent = () => {
    if (!action) return null;

    return (
      <DialogContent className="rounded-xl p-6 max-w-sm">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">{action.label}</DialogTitle>

          {action.value === "rename" && (
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          )}

          {action.value === "delete" && (
            <p className="text-red-600 text-center">
              Are you sure you want to delete <span className="font-semibold">{book.title}</span>? This action cannot be undone.
            </p>
          )}
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button onClick={closeModal} variant="outline">Cancel</Button>
          <Button onClick={handleAction} disabled={isLoading}>
            {action.label}
            {isLoading && (
              <Image src="/assets/icons/loader.svg" alt="loader" width={24} height={24} className="ml-2 animate-spin" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger>
          <Image src="/assets/icons/dots.svg" alt="dots" width={28} height={28} />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>{book.title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionItems.map((item) => (
            <DropdownMenuItem
              key={item.value}
              className="flex items-center gap-2"
              onClick={() => {
                setAction(item);
                setIsModalOpen(true);
              }}
            >
              <Image src={item.icon} alt={item.label} width={20} height={20} />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;