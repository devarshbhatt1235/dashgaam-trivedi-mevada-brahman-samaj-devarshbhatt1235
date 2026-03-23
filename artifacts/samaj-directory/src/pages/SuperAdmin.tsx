import { useState, useEffect } from "react";
import {
  useGetSamaj,
  useUpdateSamaj,
  useGetLeaders,
  useCreateLeader,
  useDeleteLeader,
  useMoveLeader,
  useGetHomes,
  useUpdateHome,
  useDeleteHome,
  useUpdateMember,
  useDeleteMember,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, Input, Label, Button } from "@/components/ui-elements";
import {
  Plus, Trash2, ArrowUp, ArrowDown, Settings, Save,
  Home, ChevronDown, ChevronRight, Pencil, X, Check, Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

type Leader = {
  id: number; name: string; role: string;
  mobile?: string; address?: string; order: number;
};
type Member = {
  id: number; sr_no: number; name: string; dob?: string;
  occupation?: string; relation: string; marital_status: string;
  mobile?: string; home_id: number;
};
type HomeType = {
  id: number; kutumb_vada_name: string; kutumb_vada_address: string;
  address: { house_no: string; faliya: string; village: string };
  members?: Member[];
};

function EditHomeModal({ home, onClose, onSaved }: { home: HomeType; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    kutumb_vada_name: home.kutumb_vada_name,
    kutumb_vada_address: home.kutumb_vada_address,
    house_no: home.address.house_no,
    faliya: home.address.faliya,
    village: home.address.village,
  });
  const updateHome = useUpdateHome({ mutation: { onSuccess: () => { toast({ title: "સફળ", description: "ઘરની માહિતી સુધારાઈ." }); onSaved(); onClose(); } } });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-secondary">ઘરની માહિતી સુધારો</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {[
            { label: "કુટુંબ વડા નામ", key: "kutumb_vada_name" },
            { label: "કુટુંબ વડા સરનામું", key: "kutumb_vada_address" },
            { label: "ઘર નંબર", key: "house_no" },
            { label: "ફળિયા", key: "faliya" },
            { label: "ગામ", key: "village" },
          ].map(({ label, key }) => (
            <div key={key}>
              <Label>{label}</Label>
              <Input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <Button onClick={() => updateHome.mutate({ id: home.id, data: form })} disabled={updateHome.isPending} className="flex-1">
            <Check className="w-4 h-4 mr-2" /> સાચવો
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">રદ કરો</Button>
        </div>
      </div>
    </div>
  );
}

function EditMemberModal({ member, homeId, onClose, onSaved }: { member: Member; homeId: number; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    sr_no: member.sr_no,
    name: member.name,
    dob: member.dob || "",
    occupation: member.occupation || "",
    relation: member.relation,
    marital_status: member.marital_status,
    mobile: member.mobile || "",
  });
  const updateMember = useUpdateMember({ mutation: { onSuccess: () => { toast({ title: "સફળ", description: "સભ્યની માહિતી સુધારાઈ." }); onSaved(); onClose(); } } });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-secondary">સભ્ય માહિતી સુધારો</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <Label>ક્રમ</Label>
            <Input type="number" value={form.sr_no} onChange={e => setForm({ ...form, sr_no: parseInt(e.target.value) || 1 })} />
          </div>
          <div>
            <Label>નામ *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>સંબંધ *</Label>
            <Input value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })} />
          </div>
          <div>
            <Label>લગ્ન સ્થિતિ</Label>
            <select
              value={form.marital_status}
              onChange={e => setForm({ ...form, marital_status: e.target.value })}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background"
            >
              <option value="unmarried">અવિવાહિત</option>
              <option value="married">વિવાહિત</option>
            </select>
          </div>
          <div>
            <Label>જન્મ તારીખ</Label>
            <Input value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} placeholder="YYYY-MM-DD" />
          </div>
          <div>
            <Label>વ્યવસાય</Label>
            <Input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} />
          </div>
          <div>
            <Label>મોબાઇલ નંબર</Label>
            <Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <Button onClick={() => updateMember.mutate({ id: homeId, memberId: member.id, data: form })} disabled={updateMember.isPending || !form.name || !form.relation} className="flex-1">
            <Check className="w-4 h-4 mr-2" /> સાચવો
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">રદ કરો</Button>
        </div>
      </div>
    </div>
  );
}

function HomeCard({ home, onRefresh }: { home: HomeType; onRefresh: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [editingHome, setEditingHome] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const deleteHome = useDeleteHome({
    mutation: {
      onSuccess: () => {
        toast({ title: "સફળ", description: "ઘર અને તમામ સભ્યો કાઢી નાખવામાં આવ્યા." });
        queryClient.invalidateQueries({ queryKey: ["/api/homes"] });
        onRefresh();
      }
    }
  });

  const deleteMember = useDeleteMember({
    mutation: {
      onSuccess: () => {
        toast({ title: "સફળ", description: "સભ્ય કાઢી નાખવામાં આવ્યા." });
        queryClient.invalidateQueries({ queryKey: ["/api/homes"] });
        onRefresh();
      }
    }
  });

  const handleDeleteHome = () => {
    if (confirm(`"${home.kutumb_vada_name}" ઘર અને તમામ સભ્યો કાઢી નાખવા માગો છો? આ ક્રિયા પૂર્વવત્ થઈ શકતી નથી.`)) {
      deleteHome.mutate({ id: home.id });
    }
  };

  const handleDeleteMember = (member: Member) => {
    if (confirm(`"${member.name}" ને ઘરમાંથી કાઢી નાખવા માગો છો?`)) {
      deleteMember.mutate({ id: home.id, memberId: member.id });
    }
  };

  const sortedMembers = home.members?.slice().sort((a, b) => a.sr_no - b.sr_no) || [];
  const firstMember = sortedMembers[0];

  return (
    <>
      {editingHome && (
        <EditHomeModal
          home={home}
          onClose={() => setEditingHome(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["/api/homes"] }); onRefresh(); }}
        />
      )}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          homeId={home.id}
          onClose={() => setEditingMember(null)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["/api/homes"] }); onRefresh(); }}
        />
      )}

      <div className="border border-border rounded-xl overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between p-4 bg-orange-50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-3">
            <button className="text-primary"><Home className="w-5 h-5" /></button>
            <div>
              <p className="font-bold text-secondary">
                {firstMember ? firstMember.name : home.kutumb_vada_name}
              </p>
              <p className="text-xs text-muted-foreground">
                ઘર {home.address.house_no} • {home.address.faliya} • {home.address.village}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-muted-foreground bg-white rounded-full px-2 py-1 border">
              <Users className="w-3 h-3 inline mr-1" />{home.members?.length || 0} સભ્ય
            </span>
            <Button variant="outline" size="sm" className="px-2" onClick={() => setEditingHome(true)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="destructive" size="sm" className="px-2" onClick={handleDeleteHome} disabled={deleteHome.isPending}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <button className="p-1 text-muted-foreground" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="p-4 space-y-4">
            {/* Members Table */}
            {sortedMembers.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-orange-50 text-secondary text-xs">
                    <tr>
                      <th className="px-3 py-2">ક્રમ</th>
                      <th className="px-3 py-2">નામ</th>
                      <th className="px-3 py-2">સંબંધ</th>
                      <th className="px-3 py-2">જન્મ તારીખ</th>
                      <th className="px-3 py-2">વ્યવસાય</th>
                      <th className="px-3 py-2">લગ્ન</th>
                      <th className="px-3 py-2">મોબાઇલ</th>
                      <th className="px-3 py-2 text-right">ક્રિયા</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedMembers.map(member => (
                      <tr key={member.id} className="hover:bg-orange-50/30">
                        <td className="px-3 py-2 font-mono">{member.sr_no}</td>
                        <td className="px-3 py-2 font-semibold">{member.name}</td>
                        <td className="px-3 py-2">{member.relation}</td>
                        <td className="px-3 py-2">{member.dob || "—"}</td>
                        <td className="px-3 py-2">{member.occupation || "—"}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${member.marital_status === "married" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {member.marital_status === "married" ? "વિવાહિત" : "અવિવાહિત"}
                          </span>
                        </td>
                        <td className="px-3 py-2">{member.mobile || "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm" className="px-1.5 py-1 h-7" onClick={() => setEditingMember(member)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="destructive" size="sm" className="px-1.5 py-1 h-7" onClick={() => handleDeleteMember(member)} disabled={deleteMember.isPending}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4 text-sm">આ ઘરમાં કોઈ સભ્ય નથી</p>
            )}

            {/* Kutumb Vada Details below members */}
            <div className="rounded-lg border border-orange-200 bg-orange-50/40 p-3">
              <p className="text-xs font-bold text-secondary mb-2">કુટુંબ વડા વિગત</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                <div><span className="text-muted-foreground">કુટુંબ વડા નામ: </span><span className="font-medium">{home.kutumb_vada_name}</span></div>
                <div><span className="text-muted-foreground">સરનામું: </span><span className="font-medium">{home.kutumb_vada_address}</span></div>
                <div><span className="text-muted-foreground">ઘર નં: </span><span className="font-medium">{home.address.house_no}</span></div>
                <div><span className="text-muted-foreground">ફળિયા: </span><span className="font-medium">{home.address.faliya}</span></div>
                <div><span className="text-muted-foreground">ગામ: </span><span className="font-medium">{home.address.village}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function SuperAdmin() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: samaj } = useGetSamaj();
  const { data: leaders } = useGetLeaders();
  const { data: homes, refetch: refetchHomes } = useGetHomes();

  const updateSamajMutation = useUpdateSamaj({
    mutation: {
      onSuccess: () => {
        toast({ title: "સફળ", description: "સમાજનું નામ બદલાઈ ગયું." });
        queryClient.invalidateQueries({ queryKey: ["/api/samaj"] });
      }
    }
  });

  const createLeaderMutation = useCreateLeader({
    mutation: {
      onSuccess: () => {
        toast({ title: "સફળ", description: "નવા આગેવાન ઉમેરાયા." });
        setNewLeader({ name: "", role: "", mobile: "", address: "", order: 1 });
        queryClient.invalidateQueries({ queryKey: ["/api/samaj/leaders"] });
      }
    }
  });

  const deleteLeaderMutation = useDeleteLeader({
    mutation: {
      onSuccess: () => {
        toast({ title: "સફળ", description: "આગેવાન કાઢી નાખ્યા." });
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
  useEffect(() => { if (samaj?.samaj_name) setSamajName(samaj.samaj_name); }, [samaj]);

  const [newLeader, setNewLeader] = useState({ name: "", role: "", mobile: "", address: "", order: 1 });
  const [homeSearch, setHomeSearch] = useState("");

  if (authLoading) return null;
  if (!user || user.role !== "super_admin") return <Redirect href="/login" />;

  const filteredHomes = homes?.filter(h => {
    const term = homeSearch.toLowerCase();
    const firstMember = h.members?.slice().sort((a, b) => a.sr_no - b.sr_no)[0];
    return (
      h.kutumb_vada_name.toLowerCase().includes(term) ||
      h.address.village.toLowerCase().includes(term) ||
      h.address.faliya.toLowerCase().includes(term) ||
      (firstMember?.name || "").toLowerCase().includes(term) ||
      h.members?.some(m => m.name.toLowerCase().includes(term))
    );
  }) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-red-600 p-3 rounded-xl text-white shadow-lg shadow-red-600/30">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-secondary">સુપર એડમિન પેનલ</h1>
          <p className="text-muted-foreground mt-1">સમાજ, આગેવાનો અને ઘર ડિરેક્ટ્રીનું સંચાલન</p>
        </div>
      </div>

      {/* Samaj Name */}
      <Card className="border-t-4 border-t-primary">
        <h2 className="text-xl font-bold mb-4">સમાજ માહિતી ફેરફાર</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input value={samajName} onChange={e => setSamajName(e.target.value)} className="max-w-md" />
          <Button onClick={() => updateSamajMutation.mutate({ data: { samaj_name: samajName } })} disabled={updateSamajMutation.isPending || !samajName}>
            <Save className="w-4 h-4 mr-2" /> સાચવો
          </Button>
        </div>
      </Card>

      {/* Add Leader */}
      <Card className="border-t-4 border-t-secondary">
        <h2 className="text-xl font-bold mb-6">નવા આગેવાન ઉમેરો</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { label: "નામ *", key: "name", placeholder: "" },
            { label: "હોદ્દો *", key: "role", placeholder: "દા.ત. પ્રમુખ, સચિવ" },
            { label: "ક્રમ", key: "order", placeholder: "", type: "number" },
            { label: "મોબાઇલ નંબર", key: "mobile", placeholder: "" },
            { label: "સરનામું", key: "address", placeholder: "", span: true },
          ].map(({ label, key, placeholder, type, span }) => (
            <div key={key} className={`space-y-2 ${span ? "lg:col-span-2" : ""}`}>
              <Label>{label}</Label>
              <Input
                type={type || "text"}
                placeholder={placeholder}
                value={(newLeader as any)[key]}
                onChange={e => setNewLeader({ ...newLeader, [key]: type === "number" ? parseInt(e.target.value) || 1 : e.target.value })}
              />
            </div>
          ))}
        </div>
        <Button onClick={() => createLeaderMutation.mutate({ data: newLeader })} disabled={!newLeader.name || !newLeader.role || createLeaderMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" /> ઉમેરો
        </Button>
      </Card>

      {/* Leaders List */}
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
            <tbody className="divide-y divide-border">
              {leaders?.map((leader, i) => (
                <tr key={leader.id} className="hover:bg-orange-50/30">
                  <td className="px-4 py-3 font-mono font-medium">{leader.order}</td>
                  <td className="px-4 py-3 font-bold">{leader.name}</td>
                  <td className="px-4 py-3">{leader.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="px-2" disabled={i === 0 || moveLeaderMutation.isPending}
                        onClick={() => moveLeaderMutation.mutate({ id: leader.id, data: { direction: "up" } })}>
                        <ArrowUp className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="outline" size="sm" className="px-2" disabled={!leaders || i === leaders.length - 1 || moveLeaderMutation.isPending}
                        onClick={() => moveLeaderMutation.mutate({ id: leader.id, data: { direction: "down" } })}>
                        <ArrowDown className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="destructive" size="sm" className="px-2"
                        onClick={() => { if (confirm("આ આગેવાનને કાઢવા માગો છો?")) deleteLeaderMutation.mutate({ id: leader.id }); }}>
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

      {/* Home Directory Management */}
      <Card className="border-t-4 border-t-green-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">ઘર ડિરેક્ટ્રી સંચાલન</h2>
            <p className="text-sm text-muted-foreground mt-1">
              કુલ {homes?.length || 0} ઘર — ઘર સુધારો, સભ્ય સુધારો / કાઢો
            </p>
          </div>
          <Home className="w-7 h-7 text-green-600" />
        </div>

        <Input
          placeholder="નામ, કુટુંબ વડા, ફળિયા, ગામ..."
          value={homeSearch}
          onChange={e => setHomeSearch(e.target.value)}
          className="mb-4 max-w-sm"
        />

        <div className="space-y-3">
          {filteredHomes.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {homeSearch ? "કોઈ ઘર મળ્યું નહીં" : "હજી કોઈ ઘર ઉમેરવામાં આવ્યું નથી"}
            </p>
          )}
          {filteredHomes.map(home => (
            <HomeCard key={home.id} home={home as HomeType} onRefresh={refetchHomes} />
          ))}
        </div>
      </Card>
    </div>
  );
}
