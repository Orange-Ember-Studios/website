import type { FC } from "@emberkit/core";

const Layout: FC = (props) => (
  <div className="min-h-screen bg-[#0b0f19] text-[#f3f4f6] font-['Outfit',sans-serif] antialiased">
    {props.children}
  </div>
);

export default Layout;
