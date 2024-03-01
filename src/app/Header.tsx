import { OrganizationSwitcher, UserButton, UserProfile } from "@clerk/nextjs";

const Header = () => {
  return (
    <div className="border-b py-4 bg-slate-200">
      <div className="items-center w-full m-auto px-4 justify-between flex">
        <div>FileDrive</div>
        <div className="flex gap-2">
          <OrganizationSwitcher />
          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
