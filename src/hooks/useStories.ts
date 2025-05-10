import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Story {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  readTime: number;
  createdAt: string;
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, we'll use mock data until the database table is created
    const mockStories = [
      {
        id: '1',
        title: 'Omusajja Yaggwa Mu Kabuyonjo',
        content: `Omusajja yaggwa mu kaabuyonjo, naye bantu batono abaakitegeela nti aguddeyo.

Wazila aba yaakagwaayo, abamu ku batono abamulabye nebayita abantu bonna mukatundu mweyali.

So nebagezaako okumujjako, ekyaabajja neviili kumitwe.

Omusajja eyali yaakagwa mu kaabuyoonjo, naavaayo nga mulamu teke. Buli omu neyeewuunya.

Naabasaba nemele, naalya, abantu kyebava baamubuuza nti "muzeeyi okikoze otya????"

Kyaava yabaddamu nti "nze siseka. nsobola nokuddayo ate nate nenvaayo, kweggamba sizannya"

Baawakanilawo, bwaatyo musajja mukulu olwo'kwagala okubakakasa, naddamu ngwaayo.

Yafa Bufi.

Mungu Rizq yo weeba ekyaali kunsi tosobola kufa, odda noojikima.

Kino kitujjukiza story ya Sulaiman eyoomusajja eyatwaalibwa empewo adduke malayika yookufa.

Kumbe jadda ate jejja okumusanga. Jaalina okufiila.

Naye ebyo tuli bilaba oluundi.`,
        excerpt: 'Omusajja yaggwa mu kaabuyonjo, naye bantu batono abaakitegeela nti aguddeyo...',
        readTime: 5,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Mungu Rizq',
        content: `Mungu Rizq yo weeba ekyaali kunsi tosobola kufa, odda noojikima.

Kino kitujjukiza story ya Sulaiman eyoomusajja eyatwaalibwa empewo adduke malayika yookufa.

Kumbe jadda ate jejja okumusanga. Jaalina okufiila.

Naye ebyo tuli bilaba oluundi.`,
        excerpt: 'Mungu Rizq yo weeba ekyaali kunsi tosobola kufa...',
        readTime: 3,
        createdAt: new Date().toISOString()
      }
    ];

    setStories(mockStories);
    setLoading(false);
  }, []);

  return { stories, loading, error };
}
