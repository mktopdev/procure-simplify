export const getDepartmentName = (departmentId?: string) => {
  switch (departmentId) {
    case "carrieres":
      return "Carrières";
    case "routes":
      return "Routes";
    case "mines":
      return "Mines";
    case "agriculture":
      return "Agriculture";
    case "siege_social":
      return "Siège Social";
    default:
      return "Département";
  }
};