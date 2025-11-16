// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   UserSchema,
//   userSchemaCreate,
//   userSchemaUpdate,
// } from "../lib/user.schema";
// import { Loader } from "lucide-react";
// import Link from "next/link";
// import { Switch } from "@/components/ui/switch";
// import { FormSelect } from "@/src/shared/components/FormSelect";
// import { UserResource } from "../lib/user.interface";
// import { CompanyResource } from "../../empresa/lib/company.interface";

// interface UserFormProps {
//   defaultValues: Partial<UserSchema>;
//   onSubmit: (data: any) => void;
//   isSubmitting?: boolean;
//   mode?: "create" | "update";
//   users: UserResource[];
//   companies: CompanyResource[];
// }

// export const UserForm = ({
//   defaultValues,
//   onSubmit,
//   isSubmitting = false,
//   mode = "create",
//   users = [],
//   companies = [],
// }: UserFormProps) => {
//   const form = useForm({
//     resolver: zodResolver(
//       mode === "create" ? userSchemaCreate : userSchemaUpdate
//     ),
//     defaultValues: {
//       ...defaultValues,
//     },
//     mode: "onChange",
//   });

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full formlayout">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormField
//             control={form.control}
//             name="descripcion"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Descripción</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Ej: Módulo de Ventas" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="route"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Ruta</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Ej: configuracion" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="icon"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Ícono</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Ej: User" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormSelect
//             control={form.control}
//             name="parent_id"
//             label="Parent"
//             placeholder="Selecciona la vista padre"
//             options={users.map((user) => ({
//               label: user.descripcion,
//               value: user.id.toString(),
//             }))}
//           />
//         </div>
//         <FormField
//           control={form.control}
//           name="submodule"
//           render={({ field }) => (
//             <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs">
//               <div className="space-y-0.5">
//                 <FormLabel> Es un Sub Módulo</FormLabel>
//                 <FormDescription>
//                   Marcar si la vista es un submódulo de otro módulo.
//                 </FormDescription>
//               </div>
//               <FormControl>
//                 <Switch
//                   checked={field.value}
//                   onCheckedChange={field.onChange}
//                 />
//               </FormControl>
//             </FormItem>
//           )}
//         />

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormField
//             control={form.control}
//             name="ruta"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Ruta Milla</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Ej: /ap/configuracion" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="icono"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Ícono de Milla</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Ej: fa fas-user" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormSelect
//             control={form.control}
//             name="company_id"
//             label="Empresa"
//             placeholder="Selecciona la empresa"
//             options={companies.map((company) => ({
//               label: company.name,
//               value: company.id.toString(),
//             }))}
//           />

//           <FormSelect
//             control={form.control}
//             name="idPadre"
//             label="Padre"
//             placeholder="Seleccionar padre"
//             options={users.map((user) => ({
//               label: user.descripcion,
//               value: user.id.toString(),
//             }))}
//           />

//           <FormSelect
//             control={form.control}
//             name="idSubPadre"
//             label="Sub Padre"
//             placeholder="Seleccionar sub padre"
//             options={users.map((user) => ({
//               label: user.descripcion,
//               value: user.id.toString(),
//             }))}
//           />

//           <FormSelect
//             control={form.control}
//             name="idHijo"
//             label="Hijo"
//             placeholder="Seleccionar hijo"
//             options={users.map((user) => ({
//               label: user.descripcion,
//               value: user.id.toString(),
//             }))}
//           />
//         </div>

//         {/* <pre>
//           <code className="text-xs text-muted-foreground">
//             {JSON.stringify(form.getValues(), null, 2)}
//           </code>
//         </pre> */}

//         <div className="flex gap-4 w-full justify-end">
//           <Link href={mode === "create" ? "./" : "../"}>
//             <Button type="button" variant="outline">
//               Cancelar
//             </Button>
//           </Link>

//           <Button
//             type="submit"
//             disabled={isSubmitting || !form.formState.isValid}
//           >
//             <Loader
//               className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
//             />
//             {isSubmitting ? "Guardando" : "Guardar Vista"}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// };
