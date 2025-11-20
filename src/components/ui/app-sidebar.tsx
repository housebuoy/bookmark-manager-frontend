import { Home, Archive , Tag, ChevronRight } from "lucide-react"
import { FaRegBookmark } from "react-icons/fa";
import TagFilter from "@/components/ui/tag-filter";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";


// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Archived",
    url: "/archived",
    icon: Archive,
  }
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarHeader
            className={cn(
              "flex items-center transition-all duration-300 bg-accent rounded",
              // Remove extra padding when collapsed
              "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 justify-start min-h-10 transition-all duration-300 -ml-4",
                // Center icon on collapse
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:ml-1.5"
              )}
            >
              <span className="bg-[#054744] text-lg text-white p-2 rounded-md flex items-center justify-center">
                <FaRegBookmark />
              </span>
              <p
                className={cn(
                  "text-lg font-medium whitespace-nowrap transition-all",
                  "group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0"
                )}
              >
                Bookmark Manager
              </p>
            </div>
          </SidebarHeader>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarMenu>
        <Collapsible defaultOpen className="group/collapsible">
            <SidebarMenuItem>
            <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                      <Tag className="mr-2" />
                      <span>Tags</span>
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
                {/* <ScrollArea className="h-96 pr-2"> */}
                <TagFilter />
                {/* </ScrollArea> */}
            </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
        </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}