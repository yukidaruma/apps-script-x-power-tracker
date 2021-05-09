const cloneDate = (date: Date): Date => new Date(date.getTime());
const formatRankingID = (date: Date): string => {
  const year = date.getFullYear().toString().substring(2, 4); // Potential Y10K problem
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}${month}01T00`;
};
export const getRankingRange = (date: Date): string => {
  const nextMonth = cloneDate(date);
  nextMonth.setDate(1);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return `${formatRankingID(date)}_${formatRankingID(nextMonth)}`;
};

type URLFetchRequest = GoogleAppsScript.URL_Fetch.URLFetchRequest;
const UserAgent =
  'Mozilla/5.0 (Linux; Android 7.1.2; Pixel Build/NJH47D; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/59.0.3071.125 Mobile Safari/537.36';
export const createSplatnetRequest = (path: string, iksm: string): URLFetchRequest => {
  const url = `${SPLATNET_API_URL}/${path}`;
  const Cookie = `iksm_session=${iksm}`;

  console.log('Sending request with', {
    url,
    iksm,
  });

  const req: URLFetchRequest = {
    url,
    headers: {
      Cookie,
      'User-Agent': UserAgent,
    },
  };
  return req;
};
