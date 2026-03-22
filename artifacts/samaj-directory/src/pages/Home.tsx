import { useGetSamaj, useGetLeaders } from "@workspace/api-client-react";
import { Card } from "@/components/ui-elements";
import { motion } from "framer-motion";
import { MapPin, Phone, Award } from "lucide-react";

export default function Home() {
  const { data: samaj, isLoading: samajLoading } = useGetSamaj();
  const { data: leaders, isLoading: leadersLoading } = useGetLeaders();

  if (samajLoading || leadersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary drop-shadow-sm"
        >
          {samaj?.samaj_name || "શ્રી સમાજ"}
        </motion.h1>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
      </section>

      {/* Deities Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="flex flex-col items-center p-8 border-t-4 border-t-primary text-center">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-8 border-orange-100 shadow-2xl mb-6 relative group">
            <div className="absolute inset-0 bg-primary/20 group-hover:opacity-0 transition-opacity duration-500"></div>
            <img
              src={`${import.meta.env.BASE_URL}images/kuldev.png`}
              alt="કુળદેવ"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
          <h2 className="text-3xl font-bold text-secondary mb-2">કુળદેવ</h2>
          <p className="text-muted-foreground text-lg">શ્રી એકલિંગજી દાદા</p>
        </Card>

        <Card className="flex flex-col items-center p-8 border-t-4 border-t-red-500 text-center">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-8 border-red-100 shadow-2xl mb-6 relative group">
            <div className="absolute inset-0 bg-red-500/20 group-hover:opacity-0 transition-opacity duration-500"></div>
            <img
              src={`${import.meta.env.BASE_URL}images/kuldevi.png`}
              alt="કુળદેવી"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
          <h2 className="text-3xl font-bold text-red-700 mb-2">કુળદેવી</h2>
          <p className="text-muted-foreground text-lg">શ્રી કાત્યાની માતા</p>
        </Card>
      </section>

      {/* Leaders Section */}
      <section className="mt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-secondary inline-block relative">
            સમાજના આગેવાનો
            <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders?.map((leader, index) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border-l-4 border-l-primary group">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {leader.name}
                    </h3>
                    <p className="text-primary font-semibold mb-3">
                      {leader.role}
                    </p>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      {leader.mobile && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-orange-400" />
                          <span>{leader.mobile}</span>
                        </div>
                      )}
                      {leader.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                          <span>{leader.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          {(!leaders || leaders.length === 0) && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              કોઈ આગેવાનો નોંધાયેલા નથી.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
