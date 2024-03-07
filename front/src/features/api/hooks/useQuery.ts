import { useApiClient } from '../context';

export const useQuery = <K>(
  deps: string | [string, ...any[]],
  request: () => Promise<K>,
  config?: ApiClientHooksConfig<K>
) => {
  const apiClient = useApiClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<K | null>(null);

  useEffect(
    () => {
      const key = typeof deps === 'string' ? deps : deps[0];
      if (apiClient.cache.queries[key]) {
        if (
          !apiClient.cache.queries[key].staleTime ||
          apiClient.cache.queries[key].staleTime >= new Date().getTime()
        ) {
          setData(apiClient.cache.queries[key].data);
          return;
        }
        apiClient.resetCacheByKey('queries', key);
      }

      setIsLoading(true);

      request()
        .then(async (response) => {
          if (apiClient?.onSuccess) {
            apiClient?.onSuccess(response);
          }
          if (config?.onSuccess) {
            config?.onSuccess(response);
          }
          apiClient.setCache('queries', key, {
            data: response,
            staleTime: config?.staleTime ?? apiClient.staleTime,
            cacheTime: config?.cacheTime ?? apiClient.cacheTime
          });
          setData(response);
          setIsLoading(false);
        })
        .catch((e) => {
          if (apiClient?.onFailure) {
            apiClient?.onFailure(e as Error);
          }
          if (config?.onFailure) {
            config?.onFailure(e as Error);
          }

          setIsLoading(false);
          setError((e as Error).message);
        });
    },
    typeof deps === 'string' ? [] : deps
  );

  return { data, error, isLoading };
};
function useState(arg0: boolean): [any, any] {
  throw new Error('Function not implemented.');
}
function useEffect(arg0: () => void, arg1: [string, ...any[]] | never[]) {
  throw new Error('Function not implemented.');
}
