import { render, screen } from "@testing-library/react";
import axiosInstance from "@/config/axiosConfig";
import projectService from "../projectService";
import ProjectAccessTab from "../ProjectAccessTab";

jest.mock("@/config/axiosConfig", () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock("../projectService", () => ({ __esModule: true, default: { listProjectTeams: jest.fn() } }));

const teams = projectService.listProjectTeams as jest.Mock;

const row = (name: string, role = "write") => ({
  id: name,
  name,
  role,
  manageWorkspace: false,
  manageState: false,
  manageJob: false,
  planJob: false,
  approveJob: false,
  destroyJob: false,
});

describe("ProjectAccessTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { data: [] } });
  });

  it("lists the teams that have access", async () => {
    teams.mockResolvedValue({ isError: false, data: { teams: [row("payments-devs")], restricted: false } });

    render(<ProjectAccessTab orgid="org" projectId="p1" canManage={false} />);

    expect(await screen.findByText("payments-devs")).toBeInTheDocument();
  });

  it("says the access list is hidden, not that nobody has access, when the caller cannot see it", async () => {
    teams.mockResolvedValue({ isError: false, data: { teams: [], restricted: true } });

    render(<ProjectAccessTab orgid="org" projectId="p1" canManage={false} />);

    expect(await screen.findByText(/You can see this project but not who has access/)).toBeInTheDocument();
    expect(screen.queryByText("No teams have been granted project-level access.")).not.toBeInTheDocument();
  });

  it("says no team has access when that is true", async () => {
    teams.mockResolvedValue({ isError: false, data: { teams: [], restricted: false } });

    render(<ProjectAccessTab orgid="org" projectId="p1" canManage />);

    expect(await screen.findByText("No teams have been granted project-level access.")).toBeInTheDocument();
  });
});
