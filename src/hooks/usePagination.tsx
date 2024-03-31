import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type PaginationMapValue = { first: string, last: string }

export const usePagination = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [startAfterId, setStartAfter] = useState('');
  const [page, setPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [paginatedMap, setPaginatedMap] = useState<Map<number, PaginationMapValue>>(new Map());

  useEffect(() => {
    let pageParam = searchParams.get('page');
    if (pageParam) {
      searchParams.set('page', pageParam.toString());
      setSearchParams(searchParams);
    } else {
      searchParams.set('page', page.toString());
      setSearchParams(searchParams);
    }
  }, []);

  const onNextPage = () => {
    searchParams.set('startAfter', paginatedMap.get(page)?.last!);
    searchParams.set('page', (page + 1).toString());
    setSearchParams(searchParams);
  };

  const onPrevPage = () => {
    if ((page - 1) === 1) {
      searchParams.delete('startAfter');
    } else {
      searchParams.set('startAfter', paginatedMap.get(page - 2)?.last!);
    }
    searchParams.set('page', (page - 1).toString());
    setSearchParams(searchParams);
  };

  useEffect(() => {
    let s = searchParams.get('startAfter');
    let p = searchParams.get('page');
    if (s) {
      setStartAfter(s);
    }
    if (p) {
      setPage(Number(p));
    }
  }, [searchParams]);

  const updatePaginationMap = (key: number, value: PaginationMapValue) => {
    setPaginatedMap(prevState => new Map(prevState.set(key, value)));
  }

  return {
    startAfterId,
    onNextPage,
    onPrevPage,
    page,
    resultsPerPage,
    setResultsPerPage,
    updatePaginationMap
  };
};