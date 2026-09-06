import Discovery from "@/components/local/Discovery";
export {haversine,formatDist} from "@/lib/local-discovery";
export default function Feed(){return <Discovery initialMode="offers"/>;}
