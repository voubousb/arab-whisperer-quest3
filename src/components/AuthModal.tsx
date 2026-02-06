import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { avatars, Avatar } from "@/data/avatars";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(avatars[0]);
  const [avatarPage, setAvatarPage] = useState(0);
  
  const { signIn, signUp } = useAuth();
  
  const avatarsPerPage = 8;
  const totalPages = Math.ceil(avatars.length / avatarsPerPage);
  const currentAvatars = avatars.slice(avatarPage * avatarsPerPage, (avatarPage + 1) * avatarsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!displayName.trim()) {
          toast.error("Entre ton pseudo !");
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, displayName, selectedAvatar.id);
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Cet email est déjà utilisé !");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Compte créé ! Vérifie tes emails pour confirmer.");
          onClose();
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error("Email ou mot de passe incorrect !");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Bienvenue !");
          onClose();
        }
      }
    } catch (err) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card-glass p-6 max-w-md w-full space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {mode === "login" ? "Connexion" : "Inscription"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  {/* Avatar Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Choisis ton avatar
                    </label>
                    
                    {/* Selected Avatar Preview */}
                    <div className="flex justify-center">
                      <motion.div
                        key={selectedAvatar.id}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center text-5xl border-4"
                        style={{ 
                          backgroundColor: selectedAvatar.color + "30",
                          borderColor: selectedAvatar.color
                        }}
                      >
                        {selectedAvatar.emoji}
                      </motion.div>
                    </div>
                    
                    {/* Avatar Grid with Pagination */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        {currentAvatars.map((avatar) => (
                          <motion.button
                            key={avatar.id}
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                              selectedAvatar.id === avatar.id
                                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                : "hover:ring-1 hover:ring-muted-foreground"
                            }`}
                            style={{ backgroundColor: avatar.color + "30" }}
                          >
                            {avatar.emoji}
                          </motion.button>
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setAvatarPage(p => Math.max(0, p - 1))}
                          disabled={avatarPage === 0}
                          className="h-8 w-8"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {avatarPage + 1} / {totalPages}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setAvatarPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={avatarPage === totalPages - 1}
                          className="h-8 w-8"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ton pseudo"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10"
                      required
                      minLength={2}
                      maxLength={20}
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-yellow"
              >
                {loading ? (
                  "Chargement..."
                ) : mode === "login" ? (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer mon compte
                  </>
                )}
              </Button>
            </form>

            {/* Switch mode */}
            <div className="text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  Pas encore de compte ?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-primary font-medium hover:underline"
                  >
                    Inscris-toi
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-primary font-medium hover:underline"
                  >
                    Connecte-toi
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
