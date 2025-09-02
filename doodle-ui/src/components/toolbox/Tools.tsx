import { CiEraser } from "react-icons/ci";
import { FaPencil } from "react-icons/fa6";

type Tool = "pencil" | "eraser";

type ToolBoxProps = {
  selectedTool: Tool;
  onSelectTool: (tool: Tool) => void;
};

function Tools({ selectedTool, onSelectTool }: ToolBoxProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onSelectTool("pencil")}
        className={`w-12 h-12 border-2 rounded-md flex items-center justify-center transition-colors ${
          selectedTool === "pencil"
            ? "bg-yellow-300 border-yellow-400"
            : "bg-white hover:bg-gray-100 border-gray-300"
        }`}
      >
        <FaPencil size={20} />
      </button>

      <button
        onClick={() => onSelectTool("eraser")}
        className={`w-12 h-12 border-2 rounded-md flex items-center justify-center transition-colors ${
          selectedTool === "eraser"
            ? "bg-yellow-300 border-yellow-400"
            : "bg-white hover:bg-gray-100 border-gray-300"
        }`}
      >
        <CiEraser size={20} />
      </button>
    </div>
  );
}

export default Tools;
