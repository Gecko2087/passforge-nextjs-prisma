import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DeletePasswordAction } from "../_actions/delete-password.action"
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Props {
    id: string;
}

export function PasswordDeleteDialog({ id }: Props) {

    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: (id: string) => DeletePasswordAction(id),
        async onSuccess(data) {
            toast.success(`Password ${data.title} fue eliminada`);
            queryClient.invalidateQueries({
                queryKey: ["passwords"]
            });
        },
        onError() {
            toast.error("Ocurrió un error de servidor");
        }
    })

    return (
        <AlertDialog>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer">
                                <Trash2Icon className="h-5 w-5" />
                            </Button>
                        </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar contraseña</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estas seguro de eliminar esta contraseña?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no puede deshacerse. Esta contraseña se eliminará permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => { mutate(id) }}
                        disabled={isPending}
                    >Continuar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default PasswordDeleteDialog;