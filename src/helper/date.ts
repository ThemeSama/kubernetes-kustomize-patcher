import { format } from "date-fns";

export const now = () => {
  return format(new Date(), "yyyy-MM-dd pppp");
};
