
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, VideoOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ManualControl = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
    
    toast({
      title: isStreaming ? "Live Stream Ended" : "Live Stream Started",
      description: isStreaming 
        ? "You have successfully ended the live stream." 
        : "Your live stream has successfully started.",
      variant: isStreaming ? "default" : "success",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Manual Control</h1>
          <p className="text-muted-foreground">
            Manage and control your live streaming settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="stream" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="stream">Stream Control</TabsTrigger>
          <TabsTrigger value="settings">Stream Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stream" className="space-y-6">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-48 w-full bg-black/10 rounded-lg flex items-center justify-center">
                {isStreaming ? (
                  <Video size={64} className="text-medical-500" />
                ) : (
                  <VideoOff size={64} className="text-muted-foreground" />
                )}
              </div>
              
              <div className="w-full max-w-md">
                <Button 
                  className="w-full gap-2"
                  variant={isStreaming ? "destructive" : "default"}
                  onClick={toggleStream}
                >
                  {isStreaming ? (
                    <>
                      <VideoOff size={18} />
                      End Live Stream
                    </>
                  ) : (
                    <>
                      <Video size={18} />
                      Stream Live
                    </>
                  )}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground text-center mt-2">
                {isStreaming 
                  ? "Your stream is currently live. Click to end the stream." 
                  : "Start streaming to your connected devices."}
              </div>
            </div>
          </div>
          
          {isStreaming && (
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Stream Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-green-500">Live</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">00:00:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality:</span>
                  <span className="font-medium">HD (720p)</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Stream Settings</h3>
            <p className="text-muted-foreground">
              Configure your stream settings and preferences here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManualControl;
