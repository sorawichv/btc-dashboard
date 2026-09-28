import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Bitcoin, Wallet, TrendingUp, TrendingDown, RefreshCw, Target, 
  Activity, Link as LinkIcon, Download, AlertCircle, CheckCircle2,
  LogOut, User as UserIcon, Lock, Settings, X, Plus, Save
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// --- ACTUAL FIREBASE INITIALIZATION ---
const myFirebaseConfig = {
  apiKey: "AIzaSyCDLsc2Bc1hUcDR_EEBvLX-W2di0z3BA_o",
  authDomain: "btc-port-tracker.firebaseapp.com",
  projectId: "btc-port-tracker",
  storageBucket: "btc-port-tracker.firebasestorage.app",
  messagingSenderId: "654131060867",
  appId: "1:654131060867:web:3418ab6bc36d544fe97bb6",
  measurementId: "G-G9756XV5GK"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : myFirebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'crypto-dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-orange-500">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  // Inject Font: Noto Sans Thai Looped
  const fontStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai+Looped:wght@300;400;500;600;700&display=swap');
    .font-noto-looped {
      font-family: 'Noto Sans Thai Looped', sans-serif !important;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: fontStyle }} />
      <div className="font-noto-looped">
        {!user || !user.email ? <AuthScreen /> : <DashboardScreen user={user} />}
      </div>
    </>
  );
}

// ==========================================
// 1. COMPONENT: Auth Screen
// ==========================================
function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      let errorMsg = 'เกิดข้อผิดพลาด กรุณาลองใหม่';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         errorMsg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      } else if (err.code === 'auth/email-already-in-use') {
         errorMsg = 'อีเมลนี้ถูกใช้งานแล้ว';
      } else if (err.code === 'auth/weak-password') {
         errorMsg = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 text-slate-200">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex justify-center mb-6 relative z-10">
          <div className="bg-orange-500/20 p-4 rounded-full text-orange-500">
            <Bitcoin size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 relative z-10" style={{ color: '#ffffff' }}>
          {isRegister ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ'}
        </h2>
        <p className="text-slate-400 text-center text-sm mb-8 relative z-10">
          ติดตามพอร์ต BTC ของคุณ
        </p>

        {error && (
          <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 p-3 rounded-xl text-sm mb-4 flex items-center gap-2 relative z-10">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ color: '#ffffff' }} 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all [&:-webkit-autofill]:bg-slate-800 [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]" 
                placeholder="อีเมลของคุณ"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ color: '#ffffff' }} 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all [&:-webkit-autofill]:bg-slate-800 [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]" 
                placeholder="รหัสผ่าน"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white p-3.5 rounded-xl font-medium transition-colors mt-4 shadow-lg shadow-orange-900/20"
          >
            {loading ? <RefreshCw className="animate-spin mx-auto" size={20} /> : (isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400 relative z-10">
          {isRegister ? 'มีบัญชีอยู่แล้ว? ' : 'ยังไม่มีบัญชี? '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
            {isRegister ? 'เข้าสู่ระบบที่นี่' : 'สมัครสมาชิกฟรี'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. COMPONENT: Dashboard Screen
// ==========================================
function DashboardScreen({ user }) {
  const [btcPrice, setBtcPrice] = useState(2450000); 
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  
  const [targetBtc, setTargetBtc] = useState(0.1); 
  const [portsData, setPortsData] = useState([]);
  
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState('');
  const [sheetSuccess, setSheetSuccess] = useState(false);

  // Fetch Live BTC Price
  const fetchBtcPrice = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=thb');
      const data = await response.json();
      if (data.bitcoin && data.bitcoin.thb) {
        setBtcPrice(data.bitcoin.thb);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch BTC price", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 60000);
    return () => clearInterval(interval);
  }, [fetchBtcPrice]);

  // Save Settings to Firestore Cloud
  const saveUserDataToCloud = async (url, target) => {
    if (!user) return;
    try {
      const parsedTarget = parseFloat(target) || 0;
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config');
      await setDoc(docRef, { sheetUrl: url, targetBtc: parsedTarget }, { merge: true });
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  // Fetch CSV data from Google Sheet
  const fetchSheetData = useCallback(async (urlToFetch) => {
    setSheetError('');
    setSheetSuccess(false);

    if (!urlToFetch) return false; 

    try {
      setSheetLoading(true);
      const idMatch = urlToFetch.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!idMatch) throw new Error('รูปแบบ Link Google Sheet ไม่ถูกต้อง');
      
      const sheetId = idMatch[1];
      const gidMatch = urlToFetch.match(/[#&]gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : '0';

      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลได้ (โปรดเช็คว่าแชร์ Sheet เป็น Anyone with the link แล้ว)');

      const csvText = await response.text();
      const rows = csvText.split('\n');
      const newPorts = [];
      const colors = ['bg-yellow-500', 'bg-blue-500', 'bg-yellow-400', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'];
      
      let headerFound = false;
      let colName = -1, colCoin = -1, colAmount = -1, colCost = -1;

      for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
        if (!headerFound) {
          colName = cols.findIndex(c => c.includes('ชื่อ port') || c.includes('port'));
          colCoin = cols.findIndex(c => c.includes('หุ้น') || c.includes('เหรียญ'));
          colAmount = cols.findIndex(c => c.includes('ปริมาณหุ้น') || c.includes('จำนวน'));
          colCost = cols.findIndex(c => c.includes('ทุน AVG') || c.includes('ทุนรวม'));
          
          if (colName !== -1 && colAmount !== -1 && colCost !== -1) headerFound = true;
          continue;
        }

        if (headerFound && cols[colName] && cols[colName] !== '') {
           const isBtc = colCoin !== -1 ? cols[colCoin].toUpperCase() === 'BTC' : true; 
           if (isBtc && !cols[colName].includes('รวม')) { 
              const btcAmount = parseFloat(cols[colAmount].replace(/,/g, ''));
              const totalCostThb = parseFloat(cols[colCost].replace(/,/g, ''));
              
              if (!isNaN(btcAmount) && !isNaN(totalCostThb) && btcAmount > 0) {
                 newPorts.push({
                   id: cols[colName].toLowerCase().replace(/\s+/g, '-'),
                   name: cols[colName],
                   btcAmount: btcAmount,
                   totalCostThb: totalCostThb,
                   color: colors[newPorts.length % colors.length]
                 });
              }
           }
        }
      }

      if (newPorts.length > 0) {
        setPortsData(newPorts);
        return true; 
      } else {
        throw new Error('ไม่พบข้อมูล BTC ในหน้านี้');
      }

    } catch (err) {
      setSheetError(err.message);
      return false;
    } finally {
      setSheetLoading(false);
    }
  }, []);

  // Save Settings Trigger
  const handleSaveSettings = async () => {
    await saveUserDataToCloud(sheetUrl, targetBtc);
    
    if (sheetUrl) {
      const isSuccess = await fetchSheetData(sheetUrl);
      if (isSuccess) {
        setSheetSuccess(true);
        setTimeout(() => {
          setShowSettings(false);
          setSheetSuccess(false);
        }, 1500);
      }
    } else {
      setSheetSuccess(true);
      setTimeout(() => {
        setShowSettings(false);
        setSheetSuccess(false);
      }, 1500);
    }
  };

  // Load User Data from Cloud
  useEffect(() => {
    if (!user) return;
    const loadUserData = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.targetBtc !== undefined) setTargetBtc(data.targetBtc);
          if (data.sheetUrl) {
            setSheetUrl(data.sheetUrl);
            fetchSheetData(data.sheetUrl);
          }
        } else {
          setShowSettings(true);
        }
      } catch (error) {
        console.error("Error fetching user settings", error);
      }
    };
    loadUserData();
  }, [user, fetchSheetData]);

  // Calculations
  const summary = useMemo(() => {
    let totalBtc = 0;
    let totalCost = 0;
    portsData.forEach(port => {
      totalBtc += port.btcAmount;
      totalCost += port.totalCostThb;
    });

    const currentValue = totalBtc * btcPrice;
    const profitLoss = currentValue - totalCost;
    const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
    const avgCost = totalBtc > 0 ? totalCost / totalBtc : 0;

    return { totalBtc, totalCost, currentValue, profitLoss, profitLossPercent, avgCost };
  }, [btcPrice, portsData]);

  const parsedTarget = parseFloat(targetBtc) || 0.1;
  const progressPercent = useMemo(() => {
    if (parsedTarget <= 0) return 0;
    const percent = (summary.totalBtc / parsedTarget) * 100;
    return percent > 100 ? 100 : percent;
  }, [summary.totalBtc, parsedTarget]);

  const formatTHB = (num) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  const formatBTC = (num) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 }).format(num);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Live Price */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-3 rounded-full text-orange-500">
              <Bitcoin size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>BTC Portfolio Dashboard</h1>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <UserIcon size={14} className="text-purple-400" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none flex flex-col items-end bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                <span>ราคา BTC ปัจจุบัน</span>
                <button 
                  onClick={fetchBtcPrice} 
                  className={`p-1 hover:text-white transition-colors ${isLoading ? 'animate-spin text-orange-500' : ''}`}
                  title="Refresh Price"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-orange-400">
                {formatTHB(btcPrice)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                อัพเดทล่าสุด: {lastUpdated.toLocaleTimeString('th-TH')}
              </div>
            </div>

            {/* Action Buttons (Settings & Logout) */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className={`p-3 rounded-xl transition-colors border ${showSettings ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                title="ตั้งค่าพอร์ต"
              >
                {showSettings ? <X size={20} /> : <Settings size={20} />}
              </button>
              <button 
                onClick={() => signOut(auth)} 
                className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Settings Panel (Hidden by default) */}
        {showSettings && (
          <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Settings className="text-purple-400" size={20} />
              <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>ตั้งค่าพอร์ตและเชื่อมต่อข้อมูล</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div>
                <label className="block text-sm text-slate-400 mb-1">เป้าหมาย BTC (Target)</label>
                <input 
                  type="number" 
                  value={targetBtc}
                  onChange={(e) => setTargetBtc(e.target.value)}
                  step="0.01"
                  style={{ color: '#ffffff' }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 font-mono text-sm transition-colors [&:-webkit-autofill]:bg-slate-950 [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Link Google Sheet (หน้า Summary)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="วาง Link ที่นี่..."
                    style={{ color: '#ffffff' }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-white placeholder:text-slate-500 outline-none focus:border-purple-500 text-sm transition-colors [&:-webkit-autofill]:bg-slate-950 [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]"
                  />
                  <button 
                    onClick={handleSaveSettings}
                    disabled={sheetLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {sheetLoading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    บันทึก
                  </button>
                </div>
              </div>
            </div>

            {sheetError && (
              <div className="mt-4 text-sm flex items-start gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 relative z-10">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{sheetError}</p>
              </div>
            )}
            {sheetSuccess && !sheetError && (
              <div className="mt-4 text-sm flex items-start gap-2 text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 relative z-10">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <p>บันทึกข้อมูลเรียบร้อย!</p>
              </div>
            )}
          </section>
        )}

        {/* Target Goal Section */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Target className="text-blue-400" size={24} />
              <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>เป้าหมายสะสม BTC</h2>
            </div>
          </div>
          
          <div className="relative w-full h-6 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-white/20" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0% 100%)' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
              {progressPercent.toFixed(2)}% ({formatBTC(summary.totalBtc)} / {parsedTarget} BTC)
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 font-medium">มูลค่าพอร์ตปัจจุบัน</p>
              <Wallet className="text-slate-500" size={20} />
            </div>
            <div>
              <h3 className="text-3xl font-bold" style={{ color: '#ffffff' }}>{formatTHB(summary.currentValue)}</h3>
              <p className="text-sm text-slate-500 mt-2">ต้นทุนรวม: {formatTHB(summary.totalCost)}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 font-medium">จำนวน BTC รวม</p>
              <Bitcoin className="text-orange-500" size={20} />
            </div>
            <div>
              <h3 className="text-3xl font-mono font-bold" style={{ color: '#ffffff' }}>{formatBTC(summary.totalBtc)}</h3>
              <p className="text-sm text-slate-500 mt-2">
                ทุนเฉลี่ย: <span className="text-slate-300 font-medium">{formatTHB(summary.avgCost)} / BTC</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className={`absolute -right-10 -top-10 w-32 h-32 blur-3xl opacity-20 rounded-full ${summary.profitLoss >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="text-slate-400 font-medium">กำไร / ขาดทุน (P/L)</p>
              {summary.profitLoss >= 0 ? 
                <TrendingUp className="text-emerald-500" size={20} /> : 
                <TrendingDown className="text-rose-500" size={20} />
              }
            </div>
            <div className="relative z-10">
              <h3 className={`text-3xl font-bold ${summary.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {summary.profitLoss > 0 ? '+' : ''}{formatTHB(summary.profitLoss)}
              </h3>
              <p className={`text-lg font-semibold mt-1 ${summary.profitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {summary.profitLoss > 0 ? '+' : ''}{summary.profitLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Port Breakdown (Table) */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>แยกตามรายพอร์ต</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400 whitespace-nowrap">
              <thead className="bg-slate-950/50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">ชื่อพอร์ต</th>
                  <th className="px-6 py-4 font-medium text-right">จำนวน (BTC)</th>
                  <th className="px-6 py-4 font-medium text-right">ต้นทุนรวม (THB)</th>
                  <th className="px-6 py-4 font-medium text-right text-blue-400">ทุนเฉลี่ย/BTC</th>
                  <th className="px-6 py-4 font-medium text-right">มูลค่าปัจจุบัน (THB)</th>
                  <th className="px-6 py-4 font-medium text-right">P/L (THB)</th>
                  <th className="px-6 py-4 font-medium text-right">% กำไร</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {portsData.map((port) => {
                  const currentValue = port.btcAmount * btcPrice;
                  const pl = currentValue - port.totalCostThb;
                  const plPercent = port.totalCostThb > 0 ? (pl / port.totalCostThb) * 100 : 0;
                  const avgPortCost = port.btcAmount > 0 ? port.totalCostThb / port.btcAmount : 0;
                  const isProfit = pl >= 0;

                  return (
                    <tr key={port.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${port.color}`}></div>
                        <span className="font-medium" style={{ color: '#e2e8f0' }}>{port.name}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono" style={{ color: '#cbd5e1' }}>
                        {formatBTC(port.btcAmount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatTHB(port.totalCostThb)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-300">
                        {formatTHB(avgPortCost)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium" style={{ color: '#e2e8f0' }}>
                        {formatTHB(currentValue)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}{formatTHB(pl)}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {isProfit ? '+' : ''}{plPercent.toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {portsData.length === 0 && !sheetLoading && (
               <div className="p-8 text-center text-slate-500">
                  ไม่มีข้อมูลพอร์ต กดที่ไอคอนฟันเฟืองด้านบนเพื่อเชื่อมต่อ Google Sheet
               </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
