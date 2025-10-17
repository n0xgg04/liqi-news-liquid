import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.locale("vi");

dayjs.updateLocale("vi", {
  relativeTime: {
    future: "trong %s",
    past: "%s trước",
    s: "vài giây",
    m: "1 phút",
    mm: "%d phút",
    h: "1 giờ",
    hh: "%d giờ",
    d: "1 ngày",
    dd: "%d ngày",
    M: "1 tháng",
    MM: "%d tháng",
    y: "1 năm",
    yy: "%d năm",
  },
});

export function formatTimeAgo(dateStr: string) {
  const now = dayjs();
  const date = dayjs(dateStr);
  const diffDays = now.diff(date, "day");

  if (diffDays > 7) {
    return date.format("DD/MM/YYYY HH:mm");
  }

  return date.fromNow();
}
