import { useParams } from "react-router-dom";
import ApplicationDetailsInner from "./ApplicationDetailsInner";

export default function ApplicationDetailsWrapper() {
  const { studentId } = useParams();
  return <ApplicationDetailsInner key={studentId} />;
}
