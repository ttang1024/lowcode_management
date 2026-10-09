import { useEffect, useState } from 'react';
import { PublicService } from 'lowcode-services';

interface DictionaryOption {
  label: string;
  value: any;
}

/** A dictionary's options (`[{ label, value }]`), fetched once per code. */
export default function useDictionary(code: string): DictionaryOption[] {
  const [options, setOptions] = useState<DictionaryOption[]>([]);
  useEffect(() => {
    let alive = true;
    Promise.resolve(PublicService.findOptionValues({ code, pageNo: 1, pageSize: 1000 }))
      .then((res: any) => alive && setOptions(res?.models || []))
      .catch(() => alive && setOptions([]));
    return () => {
      alive = false;
    };
  }, [code]);
  return options;
}
