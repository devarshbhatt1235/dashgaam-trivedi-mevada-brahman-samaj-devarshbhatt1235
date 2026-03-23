import { useCreateHome } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, Input, Label, Button, Select } from "@/components/ui-elements";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Home as HomeIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";

const memberSchema = z.object({
  sr_no: z.coerce.number().min(1),
  name: z.string().min(1, "નામ જરૂરી છે"),
  dob: z.string().optional(),
  occupation: z.string().optional(),
  relation: z.string().min(1, "સંબંધ જરૂરી છે"),
  marital_status: z.enum(["married", "unmarried"]),
  mobile: z.string().optional(),
});

const formSchema = z.object({
  kutumb_vada_name: z.string().min(1, "કુટુંબ વડાનું નામ જરૂરી છે"),
  kutumb_vada_address: z.string().min(1, "સરનામું જરૂરી છે"),
  house_no: z.string().min(1, "ઘર નંબર જરૂરી છે"),
  faliya: z.string().min(1, "ફળિયા જરૂરી છે"),
  village: z.string().min(1, "ગામ જરૂરી છે"),
  members: z.array(memberSchema).min(1, "ઓછામાં ઓછો એક સભ્ય ઉમેરો"),
});

type FormValues = z.infer<typeof formSchema>;

export default function HomeAdmin() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const createHomeMutation = useCreateHome({
    mutation: {
      onSuccess: () => {
        toast({ title: "સફળતા", description: "ઘર સફળતાપૂર્વક ઉમેરવામાં આવ્યું." });
        form.reset();
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "ભૂલ", description: err.error || "માહિતી સાચવવામાં નિષ્ફળ." });
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kutumb_vada_name: "",
      kutumb_vada_address: "",
      house_no: "",
      faliya: "",
      village: "",
      members: [{ sr_no: 1, name: "", relation: "પોતે", marital_status: "married" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members"
  });

  if (authLoading) return null;
  if (!user || user.role !== "home_admin") return <Redirect href="/login" />;

  const onSubmit = (data: FormValues) => {
    createHomeMutation.mutate({ data });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-primary p-3 rounded-xl text-white shadow-lg shadow-primary/30">
          <HomeIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-secondary">ઘર એડમિન પેનલ</h1>
          <p className="text-muted-foreground mt-1">નવું કુટુંબ અને સભ્યો ઉમેરો</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border-t-4 border-t-primary space-y-6">
          <h2 className="text-xl font-bold text-foreground pb-2 border-b">કુટુંબની પ્રાથમિક માહિતી</h2>

          {/* Kutumb Vada Details */}
          <div>
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">કુટુંબ વડા વિગત</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>કુટુંબ વડા નામ</Label>
                <Input {...form.register("kutumb_vada_name")} placeholder="પૂરું નામ દાખલ કરો" />
                {form.formState.errors.kutumb_vada_name && (
                  <p className="text-sm text-red-500">{form.formState.errors.kutumb_vada_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>કુટુંબ વડા સરનામું</Label>
                <Input {...form.register("kutumb_vada_address")} placeholder="કુટુંબ વડાનું પૂરું સરનામું" />
                {form.formState.errors.kutumb_vada_address && (
                  <p className="text-sm text-red-500">{form.formState.errors.kutumb_vada_address.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-orange-200" />

          {/* Home Address */}
          <div>
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">ઘરનું સરનામું</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>ઘર નંબર</Label>
                <Input {...form.register("house_no")} placeholder="દા.ત. 101" />
                {form.formState.errors.house_no && (
                  <p className="text-sm text-red-500">{form.formState.errors.house_no.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>ફળિયા</Label>
                <Input {...form.register("faliya")} placeholder="ફળિયાનું નામ" />
                {form.formState.errors.faliya && (
                  <p className="text-sm text-red-500">{form.formState.errors.faliya.message}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>ગામ</Label>
                <Input {...form.register("village")} placeholder="ગામનું નામ" />
                {form.formState.errors.village && (
                  <p className="text-sm text-red-500">{form.formState.errors.village.message}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-t-4 border-t-secondary">
          <div className="flex justify-between items-center mb-6 pb-2 border-b">
            <h2 className="text-xl font-bold text-foreground">સભ્યોની યાદી</h2>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ sr_no: fields.length + 1, name: "", relation: "", marital_status: "married" })}
            >
              <Plus className="w-4 h-4 mr-1" /> નવો સભ્ય ઉમેરો
            </Button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-5 rounded-xl border border-orange-100 bg-orange-50/30 relative">
                <div className="absolute -left-3 -top-3 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                  {index + 1}
                </div>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>ક્રમ</Label>
                    <Input type="number" {...form.register(`members.${index}.sr_no`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>નામ</Label>
                    <Input {...form.register(`members.${index}.name`)} />
                    {form.formState.errors.members?.[index]?.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.members[index]?.name?.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>સંબંધ</Label>
                    <Input {...form.register(`members.${index}.relation`)} placeholder="દા.ત. પુત્ર, પત્ની" />
                  </div>
                  <div className="space-y-2">
                    <Label>જન્મ તારીખ</Label>
                    <Input type="date" {...form.register(`members.${index}.dob`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>વ્યવસાય</Label>
                    <Input {...form.register(`members.${index}.occupation`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>વૈવાહિક સ્થિતિ</Label>
                    <Select {...form.register(`members.${index}.marital_status`)}>
                      <option value="married">વિવાહિત</option>
                      <option value="unmarried">અવિવાહિત</option>
                    </Select>
                  </div>
                  <div className="space-y-2 lg:col-span-3">
                    <Label>મોબાઇલ નંબર</Label>
                    <Input {...form.register(`members.${index}.mobile`)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            className="w-full md:w-auto px-12 text-lg"
            disabled={createHomeMutation.isPending}
          >
            {createHomeMutation.isPending ? "સાચવી રહ્યા છીએ..." : "માહિતી સાચવો"}
          </Button>
        </div>
      </form>
    </div>
  );
}
