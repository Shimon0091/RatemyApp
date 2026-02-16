import {
  Shield, MapPin, CheckCircle, XCircle,
  Loader2, Lock, Settings, User, Flag,
  Search, Star, Home, FileText, LogOut,
  Menu, X, ChevronDown, ChevronRight, Heart, TrendingUp,
  Eye, Edit, Trash2, AlertCircle, Building,
  Calendar, DollarSign, MessageSquare, MessageCircle, ThumbsUp,
  ThumbsDown, MoreVertical, ArrowRight, ArrowLeft,
  Wrench, FileCheck, Clock, Filter
} from 'lucide-react'

// Centralized icon exports with consistent sizing
export const Icon = {
  // Brand & Navigation
  Dragon: (props) => <Shield className="w-6 h-6" {...props} />,
  Home: (props) => <Home className="w-5 h-5" {...props} />,
  Search: (props) => <Search className="w-5 h-5" {...props} />,
  Menu: (props) => <Menu className="w-6 h-6" {...props} />,
  Close: (props) => <X className="w-6 h-6" {...props} />,

  // Location & Property
  MapPin: (props) => <MapPin className="w-5 h-5" {...props} />,
  Building: (props) => <Building className="w-5 h-5" {...props} />,

  // Status & Feedback
  Check: (props) => <CheckCircle className="w-5 h-5" {...props} />,
  XMark: (props) => <XCircle className="w-5 h-5" {...props} />,
  XCircle: (props) => <XCircle className="w-5 h-5" {...props} />,
  Loading: (props) => <Loader2 className="w-5 h-5 animate-spin" {...props} />,
  Alert: (props) => <AlertCircle className="w-5 h-5" {...props} />,

  // User & Auth
  User: (props) => <User className="w-5 h-5" {...props} />,
  Lock: (props) => <Lock className="w-5 h-5" {...props} />,
  LogOut: (props) => <LogOut className="w-5 h-5" {...props} />,

  // Actions
  Settings: (props) => <Settings className="w-5 h-5" {...props} />,
  Flag: (props) => <Flag className="w-5 h-5" {...props} />,
  Edit: (props) => <Edit className="w-4 h-4" {...props} />,
  Trash: (props) => <Trash2 className="w-4 h-4" {...props} />,
  Eye: (props) => <Eye className="w-5 h-5" {...props} />,
  More: (props) => <MoreVertical className="w-5 h-5" {...props} />,

  // Rating & Review
  Star: (props) => <Star className="w-5 h-5" {...props} />,
  Heart: (props) => <Heart className="w-5 h-5" {...props} />,
  ThumbsUp: (props) => <ThumbsUp className="w-4 h-4" {...props} />,
  ThumbsDown: (props) => <ThumbsDown className="w-4 h-4" {...props} />,
  Message: (props) => <MessageSquare className="w-5 h-5" {...props} />,
  MessageCircle: (props) => <MessageCircle className="w-5 h-5" {...props} />,

  // Data & Content
  FileText: (props) => <FileText className="w-5 h-5" {...props} />,
  FileCheck: (props) => <FileCheck className="w-5 h-5" {...props} />,
  Calendar: (props) => <Calendar className="w-4 h-4" {...props} />,
  Dollar: (props) => <DollarSign className="w-4 h-4" {...props} />,
  DollarSign: (props) => <DollarSign className="w-5 h-5" {...props} />,
  TrendingUp: (props) => <TrendingUp className="w-5 h-5" {...props} />,
  Clock: (props) => <Clock className="w-5 h-5" {...props} />,
  Filter: (props) => <Filter className="w-5 h-5" {...props} />,
  Wrench: (props) => <Wrench className="w-5 h-5" {...props} />,

  // Navigation
  ChevronDown: (props) => <ChevronDown className="w-4 h-4" {...props} />,
  ChevronRight: (props) => <ChevronRight className="w-4 h-4" {...props} />,
  ArrowRight: (props) => <ArrowRight className="w-5 h-5" {...props} />,
  ArrowLeft: (props) => <ArrowLeft className="w-5 h-5" {...props} />,
}

export default Icon
