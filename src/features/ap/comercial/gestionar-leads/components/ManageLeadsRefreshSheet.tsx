import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";

interface FormValues {
  date_from: Date | undefined;
  date_to: Date | undefined;
  all: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (params: {
    date_from: string;
    date_to: string;
    all?: boolean;
  }) => void;
}

function getFirstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getLastDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

function toDateString(date: Date) {
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

export default function ManageLeadsRefreshSheet({
  open,
  onClose,
  onSubmit,
}: Props) {
  const form = useForm<FormValues>({
    defaultValues: {
      date_from: getFirstDayOfMonth(),
      date_to: getLastDayOfMonth(),
      all: false,
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      date_from: toDateString(values.date_from!),
      date_to: toDateString(values.date_to!),
      ...(values.all ? { all: true } : {}),
    });
    onClose();
  };

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Reasignar Leads"
      icon="RefreshCw"
      size="md"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4 pt-2"
        >
          <DatePickerFormField
            control={form.control}
            name="date_from"
            label="Fecha desde"
            placeholder="Selecciona fecha inicio"
            disabledRange={[
              { before: getFirstDayOfMonth() },
              { after: getLastDayOfMonth() },
            ]}
          />

          <DatePickerFormField
            control={form.control}
            name="date_to"
            label="Fecha hasta"
            placeholder="Selecciona fecha fin"
            disabledRange={[
              { before: getFirstDayOfMonth() },
              { after: getLastDayOfMonth() },
            ]}
          />

          <FormSwitch
            label="Modo"
            control={form.control}
            name="all"
            text={form.watch("all") ? "Todos los Leads" : "Sin Asignación"}
            description={
              form.watch("all")
                ? "Reasignar todos los leads, pero si ya un asesor tomo un lead no permitira seguir con el proceso"
                : "Se tomará leads que no cuenten con un asesor asignado"
            }
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar</Button>
          </div>
        </form>
      </Form>
    </GeneralSheet>
  );
}
