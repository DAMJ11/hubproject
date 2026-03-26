import dynamic from "next/dynamic";
import MessagesLoading from "./loading";

const MessagesPanel = dynamic(
  () => import("@/components/dashboard/MessagesPanel"),
  { loading: () => <MessagesLoading /> }
);

export default function MessagesPage() {
  return <MessagesPanel />;
}
