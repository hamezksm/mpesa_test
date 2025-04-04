import Link from "next/link";

type CardProps = {
  title: string;
  value: string;
  icon: string;
  linkTo: string;
  color: "green" | "blue" | "purple" | "orange" | "red";
};

export default function DashboardCard({ title, value, icon, linkTo, color }: CardProps) {
  const getIconClass = () => {
    switch (icon) {
      case "cash":
        return "fas fa-money-bill-wave";
      case "wallet":
        return "fas fa-wallet";
      case "phone":
        return "fas fa-mobile-alt";
      default:
        return "fas fa-circle";
    }
  };

  const getColorClass = () => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-600";
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "orange":
        return "bg-orange-100 text-orange-600";
      case "red":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Link href={linkTo}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="flex items-start">
          <div className={`p-3 rounded-full ${getColorClass()} mr-4`}>
            <i className={`${getIconClass()} text-lg`}></i>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800">{title}</h3>
            <p className="text-gray-500 mt-1">{value}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}