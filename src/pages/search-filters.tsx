
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "@/shims/next-navigation";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ALL_DEMO_USERS } from "@/lib/demo-data"; // Using demo data for now
import { useLanguage } from "@/context/language-context";
import { ChevronLeft } from "lucide-react";

export default function FiltersPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [ageRange, setAgeRange] = useState([18, 40]);
  const [distance, setDistance] = useState([50]);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const allInterests = useMemo(() => {
    const interests = new Set<string>();
    ALL_DEMO_USERS.forEach(user => {
      user.interests.forEach(interest => interests.add(interest));
    });
    return Array.from(interests);
  }, []);

  useEffect(() => {
    const savedFilters = localStorage.getItem("searchFilters");
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setAgeRange(parsed.ageRange || [18, 40]);
        setDistance(parsed.distance || [50]);
        setSelectedCity(parsed.selectedCity || "all");
        setSelectedInterests(parsed.selectedInterests || []);
      } catch (e) {
        console.error("Failed to parse filters from localStorage", e);
      }
    }
  }, []);

  const handleApply = () => {
    const filters = {
      ageRange,
      distance,
      selectedCity,
      selectedInterests
    };
    localStorage.setItem("searchFilters", JSON.stringify(filters));
    router.push("/search"); // Go back to search page to see the result
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
       <header className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white/95 backdrop-blur-lg z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-lg font-bold">{t('search.filters')}</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6 space-y-8">
        <FilterSection title={t('filters.age')}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">От {ageRange[0]} до {ageRange[1]} лет</span>
          </div>
          <Slider
            value={ageRange}
            onValueChange={setAgeRange}
            max={65}
            min={18}
            step={1}
          />
        </FilterSection>

        <FilterSection title={t('filters.distance')}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">До {distance[0]} км</span>
            </div>
            <Slider 
                value={distance}
                onValueChange={setDistance}
                max={200}
                step={5}
            />
        </FilterSection>

        <FilterSection title={t('filters.city')}>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('filters.select_city')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все города</SelectItem>
              <SelectItem value="Москва">Москва</SelectItem>
              {/* Add more cities if needed from demo data */}
            </SelectContent>
          </Select>
        </FilterSection>

        <FilterSection title={t('filters.interests')}>
            <div className="flex flex-wrap gap-2">
                {allInterests.map(interest => (
                    <Button 
                        key={interest} 
                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                        onClick={() => handleInterestToggle(interest)}
                        className="rounded-full"
                    >
                        {interest}
                    </Button>
                ))}
            </div>
        </FilterSection>
      </main>

      <footer className="p-4 bg-white border-t sticky bottom-0">
        <Button onClick={handleApply} className="w-full h-12">{t('button.apply_filters')}</Button>
      </footer>
    </div>
  );
}

function FilterSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
