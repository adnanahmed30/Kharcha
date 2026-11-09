import { useEffect, useState, type DependencyList } from "react";


interface FetchState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}


export function useFetch<T>(fetcher: () => Promise<T>, deps: DependencyList): FetchState<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        setIsLoading(true);
        setError(null);
        async function loadData() {
            try {
                const result = await fetcher();
                if (!ignore) setData(result);
            } catch (err) {
                if (!ignore) setError(err instanceof Error ? err.message : "Something went wrong!");
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }
        loadData();
        return () => { ignore = true; };
    }, deps);

    return { data, isLoading, error };

}