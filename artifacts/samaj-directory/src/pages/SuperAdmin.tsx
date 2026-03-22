import { useState, useEffect } from "react";
import { 
  useGetSamaj, 
  useUpdateSamaj, 
  useGetLeaders, 
  useCreateLeader, 
  useDeleteLeader, 
  useMoveLeader,
  Leader
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, Input, Label, Button } from "@/components/ui-elements";
import { Plus, Trash2, ArrowUp, ArrowDown, Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function SuperAdmin() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: samaj } = useGetSamaj();
  const { data: leaders } = useGetLeaders();

  const updateSamajMutation = useUpdateSamaj({
    mutation: {
      onSuccess: () => {
        toast({ title: "સફળતા", description: "સમાજનું નામ બદલાઈ ગયું છે." });
        queryClient.invalidateQueries({ queryKey: ["/api/samaj"] });
      }
    }
  });

  const createLeaderMutation = useCreateLeader({
    mutation: {
      onSuccess: () => {
        toast({ title: "સફળતા", description: "નવા આગેવાન ઉમેરાયા." });
        setNewLeader({ name: "", role: "", mobile: "", address: "", order: 1 });
        queryClient.invalidateQueries({ queryKey: ["/api/samaj/leaders"] });
      }
    }
  });

  const deleteLeaderMutation = useDeleteLeader({
    mutation: {
      onSuccess: () => {
        toast({ title: "સફળતા", description: "આગેવાન કાઢી નાખવામાં આવ્યા." });
        queryClient.invalidateQueries({ queryKey: ["/api/samaj/leaders"] });
      }
    }
  });

  const moveLeaderMutation = useMoveLeader({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/samaj/leaders"] });
      }
    }
  });

  const [samajName, setSamajName] = useState("");
  useEffect(() => {
    if (samaj?.samaj_name) setSamajName(samaj.samaj_name);
  }, [samaj]);

  const [newLeader, setNewLeader] = useState({
    name: "", role: "", mobile: "", address: "", order: 1
  });

  if (authLoading) return null;
  if (!user || user.role !== "super_admin") return <Redirect href="/login" />;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-red-600 p-3 rounded-xl text-white shadow-lg shadow-red-600/30">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-secondary">સુપર એડમિન પેનલ</h1>
          <p className="text-muted-foreground mt-1">સમાજ અને આગેવાનોનું સંચાલન</p>
        </div>
      </div>

      <Card className="border-t-4 border-t-primary">
        <h2 className="text-xl font-bold mb-4">સમાજ માહિતી ફેરફાર</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input 
            value={samajName} 
            onChange={(e) => setSamajName(e.target.value)}
            className="max-w-md"
          />
          <Button 
            onClick={() => updateSamajMutation.mutate({ data: { samaj_name: samajName } })}
            disabled={updateSamajMutation.isPending || !samajName}
          >
            <Save className="w-4 h-4 mr-2" />
            સાચવો
          </Button>
        </div>
      </Card>

      <Card className="border-t-4 border-t-secondary">
        <h2 className="text-xl font-bold mb-6">નવા આગેવાન ઉમેરો</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label>નામ *</Label>
            <Input 
              value={newLeader.name} 
              onChange={e => setNewLeader({...newLeader, name: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>હોદ્દો *</Label>
            <Input 
              placeholder="દા.ત. પ્રમુખ, સચિવ"
              value={newLeader.role} 
              onChange={e => setNewLeader({...newLeader, role: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>ક્રમ</Label>
            <Input 
              type="number"
              value={newLeader.order} 
              onChange={e => setNewLeader({...newLeader, order: parseInt(e.target.value) || 1})} 
            />
          </div>
          <div className="space-y-2">
            <Label>મોબાઇલ નંબર</Label>
            <Input 
              value={newLeader.mobile} 
              onChange={e => setNewLeader({...newLeader, mobile: e.target.value})} 
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label>સરનામું</Label>
            <Input 
              value={newLeader.address} 
              onChange={e => setNewLeader({...newLeader, address: e.target.value})} 
            />
          </div>
        </div>
        <Button 
          onClick={() => createLeaderMutation.mutate({ data: newLeader })}
          disabled={!newLeader.name || !newLeader.role || createLeaderMutation.isPending}
        >
          <Plus className="w-4 h-4 mr-2" /> ઉમેરો
        </Button>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-6">આગેવાનોની યાદી</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left">
            <thead className="bg-orange-50 text-secondary">
              <tr>
                <th className="px-4 py-3 font-semibold w-16">ક્રમ</th>
                <th className="px-4 py-3 font-semibold">નામ</th>
                <th className="px-4 py-3 font-semibold">હોદ્દો</th>
                <th className="px-4 py-3 font-semibold text-right">ક્રિયાઓ</th>
              </tr>
            </thead>
            <tbody className="divide-y border-border">
              {leaders?.map((leader, i) => (
                <tr key={leader.id} className="hover:bg-orange-50/30">
                  <td className="px-4 py-3 font-mono font-medium">{leader.order}</td>
                  <td className="px-4 py-3 font-bold">{leader.name}</td>
                  <td className="px-4 py-3">{leader.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2"
                        disabled={i === 0 || moveLeaderMutation.isPending}
                        onClick={() => moveLeaderMutation.mutate({ id: leader.id, data: { direction: "up" } })}
                      >
                        <ArrowUp className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2"
                        disabled={i === leaders.length - 1 || moveLeaderMutation.isPending}
                        onClick={() => moveLeaderMutation.mutate({ id: leader.id, data: { direction: "down" } })}
                      >
                        <ArrowDown className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="px-2"
                        onClick={() => {
                          if(confirm("તમે ચોક્કસ આ આગેવાનને કાઢવા માગો છો?")) {
                            deleteLeaderMutation.mutate({ id: leader.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!leaders || leaders.length === 0) && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">કોઈ માહિતી નથી</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
