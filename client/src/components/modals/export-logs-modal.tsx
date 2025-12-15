import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, AlertCircle } from "lucide-react";

interface ExportLogsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceCode?: string;
}

export function ExportLogsModal({ open, onOpenChange, sourceCode }: ExportLogsModalProps) {
  const [endpointId, setEndpointId] = useState("");
  const [additionalProperties, setAdditionalProperties] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!endpointId.trim()) {
      toast({
        title: "Missing Endpoint ID",
        description: "Please enter an Endpoint ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/impact-assessment/export-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpointId: endpointId.trim(),
          additionalProperties: additionalProperties.trim(),
          sourceCode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to export logs");
      }

      const data = await response.json();

      toast({
        title: "Export Successful",
        description: `Logs exported for endpoint ${endpointId}`,
      });

      // Reset form and close modal
      setEndpointId("");
      setAdditionalProperties("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Export logs error:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export logs. Please check the endpoint configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteEndpoint = async () => {
    if (!endpointId.trim()) {
      toast({
        title: "Missing Endpoint ID",
        description: "Please enter an Endpoint ID",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);

    try {
      const response = await fetch("/api/impact-assessment/execute-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpointId: endpointId.trim(),
          additionalProperties: additionalProperties.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to execute endpoint");
      }

      const data = await response.json();

      toast({
        title: "Endpoint Executed",
        description: `Successfully executed endpoint ${endpointId}`,
      });

      // Keep the modal open so user can see results
    } catch (error: any) {
      console.error("Execute endpoint error:", error);
      toast({
        title: "Execution Failed",
        description: error.message || "Failed to execute external endpoint. Please check the endpoint URL format.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Impact Assessment Logs
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="endpoint-id">Endpoint ID *</Label>
            <Input
              id="endpoint-id"
              placeholder="Enter endpoint ID (e.g., EP_001, endpoint-abc123)"
              value={endpointId}
              onChange={(e) => setEndpointId(e.target.value)}
              disabled={isLoading}
              className="font-mono text-sm"
              data-testid="input-endpoint-id"
            />
            <p className="text-xs text-muted-foreground">
              The unique identifier for the endpoint to export logs from
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-properties">Additional Properties</Label>
            <Textarea
              id="additional-properties"
              placeholder={`Enter additional properties as comma-delimited values (optional)\n\nExample:\nprop1, prop2, prop3`}
              value={additionalProperties}
              onChange={(e) => setAdditionalProperties(e.target.value)}
              disabled={isLoading || isExecuting}
              rows={4}
              className="font-mono text-sm"
              data-testid="textarea-additional-properties"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Comma-delimited properties (spaces will be trimmed). Used in external endpoint format: /api/v1/&lt;endpointId&gt;/&lt;properties&gt;
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border">
            <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Make sure the impact assessment export endpoint is configured in config.yaml before proceeding.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || isExecuting}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleExecuteEndpoint}
              disabled={isLoading || isExecuting || !endpointId.trim()}
              data-testid="button-execute-endpoint"
            >
              {isExecuting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border border-current border-t-transparent rounded-full" />
                  Executing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Execute Endpoint
                </>
              )}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isExecuting || !endpointId.trim()}
              className="bg-brand-accent hover:bg-brand-accent/90"
              data-testid="button-export"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border border-current border-t-transparent rounded-full" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
