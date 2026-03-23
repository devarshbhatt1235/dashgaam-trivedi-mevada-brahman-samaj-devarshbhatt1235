import { useState } from "react";
import { useGetHomes } from "@workspace/api-client-react";
import { Card, Input } from "@/components/ui-elements";
import { Search, MapPin, HomeIcon, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Directory() {
  const { data: homes, isLoading } = useGetHomes();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredHomes = homes?.filter((home) => {
    const term = searchTerm.toLowerCase();
    const firstMember = home.members?.slice().sort((a, b) => a.sr_no - b.sr_no)[0];
    return (
      home.kutumb_vada_name.toLowerCase().includes(term) ||
      home.address.village.toLowerCase().includes(term) ||
      home.address.faliya.toLowerCase().includes(term) ||
      (firstMember?.name || "").toLowerCase().includes(term) ||
      home.members?.some(m => m.name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-secondary">ઘર ડિરેક્ટ્રી</h1>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="નામ, કુટુંબ વડા, ફળિયા, ગામ..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredHomes?.map((home, i) => {
            const sortedMembers = home.members?.slice().sort((a, b) => a.sr_no - b.sr_no) || [];
            const firstMember = sortedMembers[0];

            return (
              <motion.div
                key={home.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden p-0 border-orange-100 hover:border-orange-300 transition-colors">
                  <button
                    onClick={() => setExpandedId(expandedId === home.id ? null : home.id)}
                    className="w-full text-left px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-orange-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-orange-100 p-3 rounded-full text-primary mt-1">
                        <HomeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {firstMember ? firstMember.name : home.kutumb_vada_name}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-orange-400" />
                            {home.address.house_no}, {home.address.faliya}, {home.address.village}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full font-medium shrink-0">
                      <Users className="w-4 h-4" />
                      {home.members?.length || 0} સભ્યો
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedId === home.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-6 bg-orange-50/30 space-y-5">
                          {/* Members Table */}
                          <div>
                            <h4 className="font-bold text-secondary mb-4">સભ્યોની યાદી</h4>
                            <div className="overflow-x-auto rounded-xl border border-orange-200 bg-white shadow-sm">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-orange-100/80 text-secondary">
                                  <tr>
                                    <th className="px-4 py-3 font-semibold">ક્રમ</th>
                                    <th className="px-4 py-3 font-semibold">નામ</th>
                                    <th className="px-4 py-3 font-semibold">સંબંધ</th>
                                    <th className="px-4 py-3 font-semibold">જન્મ તારીખ</th>
                                    <th className="px-4 py-3 font-semibold">વ્યવસાય</th>
                                    <th className="px-4 py-3 font-semibold">સ્થિતિ</th>
                                    <th className="px-4 py-3 font-semibold">મોબાઇલ</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y border-orange-100">
                                  {sortedMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-orange-50/50 transition-colors">
                                      <td className="px-4 py-3">{member.sr_no}</td>
                                      <td className="px-4 py-3 font-medium text-foreground">{member.name}</td>
                                      <td className="px-4 py-3">{member.relation}</td>
                                      <td className="px-4 py-3">{member.dob || "-"}</td>
                                      <td className="px-4 py-3">{member.occupation || "-"}</td>
                                      <td className="px-4 py-3">
                                        <span className={cn(
                                          "px-2.5 py-1 rounded-full text-xs font-semibold",
                                          member.marital_status === "married"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-blue-100 text-blue-700"
                                        )}>
                                          {member.marital_status === "married" ? "વિવાહિત" : "અવિવાહિત"}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">{member.mobile || "-"}</td>
                                    </tr>
                                  ))}
                                  {sortedMembers.length === 0 && (
                                    <tr>
                                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        કોઈ સભ્યો નોંધાયેલા નથી
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Kutumb Vada Details below members */}
                          <div className="rounded-xl border border-orange-200 bg-white p-4">
                            <h4 className="font-bold text-secondary mb-3 text-sm">કુટુંબ વડા વિગત</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">કુટુંબ વડા નામ: </span>
                                <span className="font-medium">{home.kutumb_vada_name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">કુટુંબ વડા સરનામું: </span>
                                <span className="font-medium">{home.kutumb_vada_address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
          {filteredHomes?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              કોઈ પરિણામ મળ્યું નથી.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
