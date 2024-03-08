import { FileBrowser } from "../_components/file-browser";

const trashPage = () => {
  return (
    <div>
      <FileBrowser title={"Trash"} deletedOnly />
    </div>
  );
};

export default trashPage;
