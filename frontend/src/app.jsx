        // ── Profile Component ────────────────────────────────────
        const Profile = () => {
            const { user, healthProfile, setHealthProfile, navigate } = useAppContext();
            const [step, setStep] = useState(1);
            const [profileData, setProfileData] = useState(healthProfile || { height:'', weight:'', allergies:[], medicalConditions:[], dietaryPreferences:[] });

            const commonAllergies = ['Peanuts','Tree nuts','Milk','Eggs','Soy','Wheat / Gluten','Shellfish','Fish','Sesame','Mustard','Sulphites','Celery'];
            const commonConditions = ['Diabetes','High blood pressure','Lactose intolerance','Gluten intolerance','Food sensitivities'];
            const commonDiets = ['Vegan','Vegetarian','Keto','Low sugar','Low carb'];

            const toggleArrayItem = (category, item) => {
                setProfileData(prev => { const arr = prev[category]; return arr.includes(item) ? {...prev,[category]:arr.filter(i=>i!==item)} : {...prev,[category]:[...arr,item]}; });
            };
            const handleSave = () => { setHealthProfile(profileData); navigate('dashboard'); };

            return (
                <div className="min-h-[calc(100vh-4rem)] bg-black py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-display font-bold text-white">Your Health Profile</h2>
                            <p className="mt-2 text-zinc-400">Configure your safety filters for personalized risk analysis.</p>
                        </div>
                        <div className="bg-zinc-900 rounded-[2rem] shadow-xl border border-zinc-800 p-8">
                            <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto hide-scrollbar">
                                {[1,2,3].map(num=>(<button key={num} onClick={()=>setStep(num)} className={`flex-1 py-4 text-sm font-semibold transition-colors whitespace-nowrap px-4 border-b-2 ${step===num?'border-emerald-400 text-emerald-400':'border-transparent text-zinc-500 hover:text-zinc-300'}`}>{num===1&&'1. Basic Info'}{num===2&&'2. Allergies'}{num===3&&'3. Conditions & Diet'}</button>))}
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
                                    {step===1&&(
                                        <div className="space-y-6">
                                            {user && user.photo && <div className="flex items-center space-x-4 mb-6 p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50"><img src={user.photo} alt="" className="w-14 h-14 rounded-full border-2 border-emerald-500/30"/><div><div className="font-bold text-white">{user.name}</div><div className="text-sm text-zinc-400">{user.email}</div></div></div>}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div><label className="block text-sm font-medium text-zinc-300 mb-1">Height (cm)</label><input type="number" value={profileData.height} onChange={e=>setProfileData({...profileData,height:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-emerald-500 transition-colors" placeholder="e.g. 175"/></div>
                                                <div><label className="block text-sm font-medium text-zinc-300 mb-1">Weight (kg)</label><input type="number" value={profileData.weight} onChange={e=>setProfileData({...profileData,weight:e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-emerald-500 transition-colors" placeholder="e.g. 70"/></div>
                                            </div>
                                        </div>
                                    )}
                                    {step===2&&(
                                        <div>
                                            <div className="mb-4 flex items-center justify-between"><label className="block text-sm font-medium text-zinc-300">Select Known Allergies</label><span className="text-xs text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded-full uppercase tracking-wider">Crucial for Safety</span></div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {commonAllergies.map(allergy=>{const sel=profileData.allergies.includes(allergy);return(<div key={allergy} onClick={()=>toggleArrayItem('allergies',allergy)} className={`cursor-pointer rounded-xl border flex items-center justify-center py-3 px-2 text-sm font-medium transition-all ${sel?'bg-red-500/10 border-red-500 text-red-400':'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-white'}`}>{sel&&<CheckCircle size={14} className="mr-1.5"/>}{allergy}</div>);})}
                                            </div>
                                        </div>
                                    )}
                                    {step===3&&(
                                        <div className="space-y-8">
                                            <div><label className="block text-sm font-medium text-zinc-300 mb-3">Medical Conditions</label><div className="flex flex-wrap gap-2">{commonConditions.map(c=>{const sel=profileData.medicalConditions.includes(c);return(<div key={c} onClick={()=>toggleArrayItem('medicalConditions',c)} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all ${sel?'bg-brand-blue border-brand-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]':'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}>{c}</div>);})}</div></div>
                                            <div><label className="block text-sm font-medium text-zinc-300 mb-3">Dietary Preferences</label><div className="flex flex-wrap gap-2">{commonDiets.map(d=>{const sel=profileData.dietaryPreferences.includes(d);return(<div key={d} onClick={()=>toggleArrayItem('dietaryPreferences',d)} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all ${sel?'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.5)]':'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}>{d}</div>);})}</div></div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                            <div className="mt-10 flex justify-between items-center border-t border-zinc-800 pt-6">
                                <button onClick={()=>step>1?setStep(step-1):navigate('dashboard')} className="text-zinc-500 font-medium hover:text-white transition-colors">{step===1?'Skip for now':'Back'}</button>
                                <button onClick={()=>step<3?setStep(step+1):handleSave()} className="bg-gradient-to-r from-emerald-600 to-emerald-800 border border-emerald-500/50 text-white px-8 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(4,120,87,0.4)] hover:shadow-[0_0_25px_rgba(4,120,87,0.6)] focus:outline-none transition-all">{step===3?'Save Profile':'Continue'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // ── Scanner Component (Real OCR) ────────────────────────
        const Scanner = () => {
            const { navigate, healthProfile, setScanResult } = useAppContext();
            const [isDragging, setIsDragging] = useState(false);
            const [file, setFile] = useState(null);
            const [preview, setPreview] = useState(null);
            const [analyzing, setAnalyzing] = useState(false);
            const [progress, setProgress] = useState(0);
            const [error, setError] = useState('');
            const [statusMsg, setStatusMsg] = useState('');

            // Camera scan additions
            const [scanMode, setScanMode] = useState('upload'); // 'upload' or 'camera'
            const [stream, setStream] = useState(null);
            const videoRef = useRef(null);
            const canvasRef = useRef(null);

            const startCamera = async () => {
                setError('');
                try {
                    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    setStream(s);
                    if (videoRef.current) videoRef.current.srcObject = s;
                } catch (err) {
                    setError('Camera access denied. Please check your browser permissions.');
                    setScanMode('upload');
                }
            };

            const stopCamera = () => {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    setStream(null);
                }
            };

            const capturePhoto = () => {
                if (videoRef.current && canvasRef.current) {
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        const capturedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
                        processFile(capturedFile);
                    }, 'image/jpeg', 0.95);
                }
            };

            useEffect(() => {
                if (scanMode === 'camera') startCamera();
                else stopCamera();
                return () => stopCamera();
            }, [scanMode]);

            const processFile = async (selectedFile) => {
                setFile(selectedFile);
                setPreview(URL.createObjectURL(selectedFile));
                setAnalyzing(true);
                setError('');
                setProgress(5);
                setStatusMsg('Uploading image...');

                const formData = new FormData();
                formData.append('image', selectedFile);

                // Send user profile data
                if (healthProfile) {
                    formData.append('allergies_json', JSON.stringify(healthProfile.allergies || []));
                    formData.append('conditions_json', JSON.stringify(healthProfile.medicalConditions || []));
                    formData.append('diet_json', JSON.stringify(healthProfile.dietaryPreferences || []));
                }

                // Progress simulation while waiting for backend
                let fakeProgress = 5;
                const progressTimer = setInterval(() => {
                    fakeProgress += Math.random() * 8;
                    if (fakeProgress > 85) fakeProgress = 85;
                    setProgress(fakeProgress);
                    if (fakeProgress > 20) setStatusMsg('Running OCR scan...');
                    if (fakeProgress > 50) setStatusMsg('Analyzing ingredients...');
                    if (fakeProgress > 70) setStatusMsg('Checking allergen database...');
                }, 500);

                try {
                    const res = await fetch(`${BACKEND_URL}/api/scan`, { method: 'POST', body: formData });
                    const data = await res.json();
                    clearInterval(progressTimer);

                    if (data.success) {
                        setProgress(100);
                        setStatusMsg('Analysis complete!');
                        setScanResult(data);
                        setTimeout(() => navigate('results'), 600);
                    } else {
                        setError(data.error || 'Scan failed');
                        setAnalyzing(false);
                    }
                } catch (err) {
                    clearInterval(progressTimer);
                    setError('Could not connect to backend. Make sure the Flask server is running on port 5000.');
                    setAnalyzing(false);
                }
            };

            return (
                <div className="min-h-[calc(100vh-4rem)] bg-black py-12 px-4 sm:px-6 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-amber-500/10 blur-[80px]"></div>
                    
                    <div className="max-w-xl w-full text-center z-10">
                        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="mb-8">
                            <div className="w-20 h-20 bg-zinc-900 border border-emerald-500/30 shadow-[0_0_30px_rgba(4,120,87,0.3)] rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-emerald-400 transform rotate-3"><Camera size={40}/></div>
                            <h2 className="text-4xl font-display font-bold text-white mb-3">Scan Product Label</h2>
                            <p className="text-zinc-400 text-lg">Choose a method to scan the ingredients list.</p>
                        </motion.div>

                        {!analyzing && (
                            <div className="flex bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl mb-8 w-fit mx-auto shadow-lg">
                                <button 
                                    onClick={() => setScanMode('upload')}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${scanMode === 'upload' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <UploadCloud size={16}/><span>Upload File</span>
                                </button>
                                <button 
                                    onClick={() => setScanMode('camera')}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${scanMode === 'camera' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <Camera size={16}/><span>Use Camera</span>
                                </button>
                            </div>
                        )}

                        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-sm text-left"><AlertTriangle size={18} className="mt-0.5 flex-shrink-0"/><div><p className="font-bold uppercase tracking-wider text-[10px] mb-1">Scan Error</p><p>{error}</p></div></div>}

                        <AnimatePresence mode="wait">
                            {!analyzing ? (
                                scanMode === 'upload' ? (
                                    <motion.div key="upload" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.9}}
                                        className={`border-3 border-dashed rounded-[2rem] p-12 transition-all cursor-pointer backdrop-blur-sm ${isDragging?'border-emerald-500 bg-emerald-500/10 scale-105':'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-emerald-500/50 shadow-xl'}`}
                                        onDragOver={e=>{e.preventDefault();setIsDragging(true);}} onDragLeave={()=>setIsDragging(false)}
                                        onDrop={e=>{e.preventDefault();setIsDragging(false);if(e.dataTransfer.files[0])processFile(e.dataTransfer.files[0]);}}
                                        onClick={()=>document.getElementById('file-upload').click()}>
                                        <UploadCloud size={56} className={`mx-auto mb-4 transition-colors ${isDragging?'text-emerald-400':'text-zinc-600'}`}/>
                                        <h3 className="text-2xl font-bold text-white mb-2">Drag & Drop Image</h3>
                                        <p className="text-zinc-500 mb-8">or click to browse your files</p>
                                        <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={e=>{if(e.target.files[0])processFile(e.target.files[0]);}}/>
                                        <button className="bg-zinc-800 border border-zinc-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-zinc-700 hover:border-zinc-600 transition-all">Select File</button>
                                    </motion.div>
                                ) : (
                                    <motion.div key="camera" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.9}}
                                        className="bg-zinc-900/50 backdrop-blur-sm border-2 border-zinc-700 rounded-[2rem] overflow-hidden relative shadow-2xl">
                                        <div className="aspect-video bg-black flex items-center justify-center relative">
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                            {/* Scanning Animation Overlay */}
                                            <motion.div initial={{top:'0%'}} animate={{top:'100%'}} transition={{duration:3,repeat:Infinity,ease:"linear"}} className="absolute left-0 w-full h-[1px] bg-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,1)] z-10"/>
                                            <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none"></div>
                                        </div>
                                        <div className="p-8 flex flex-col items-center">
                                            <canvas ref={canvasRef} className="hidden" />
                                            <button 
                                                onClick={capturePhoto}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(5,150,105,0.4)] transition-all hover:scale-110 active:scale-95 border-4 border-white/10"
                                            >
                                                <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
                                                    <Camera size={32}/>
                                                </div>
                                            </button>
                                            <p className="text-zinc-500 mt-4 text-sm font-medium">Align the label and tap to scan</p>
                                        </div>
                                    </motion.div>
                                )
                            ) : (
                                <motion.div key="analyzing" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="bg-zinc-900 rounded-[2rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-zinc-800 relative overflow-hidden">
                                    <motion.div initial={{top:'0%'}} animate={{top:'100%'}} transition={{duration:1.5,repeat:Infinity,repeatType:'reverse',ease:"linear"}} className="absolute left-0 w-full h-[2px] bg-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,1)] z-20"/>
                                    <div className="relative z-10">
                                        {preview && <img src={preview} alt="Scanning" className="w-32 h-32 object-cover rounded-2xl mx-auto mb-6 border border-zinc-700 shadow-lg"/>}
                                        {!preview && <div className="w-16 h-16 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_15px_rgba(52,211,153,0.3)]"></div>}
                                        <h3 className="text-2xl font-bold text-white mb-2">Analyzing Label...</h3>
                                        <p className="text-zinc-400 mb-2 italic font-['Playfair_Display'] text-lg">{statusMsg}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-600 mb-8 mt-4">Powered by Tesseract OCR + Spectral AI</p>
                                        <div className="w-full bg-zinc-800 rounded-full h-2 mb-3 overflow-hidden shadow-inner"><motion.div className="bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{width:`${progress}%`}} layout/></div>
                                        <div className="flex justify-between text-[10px] font-bold text-zinc-500 font-mono tracking-widest"><span>OCR_SCAN_IN_PROGRESS</span><span className="text-emerald-400">{Math.round(progress)}%</span></div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            );
        };

        // ── Sidebar Component ─────────────────────────────────────
        const Sidebar = ({ activePage }) => {
            const { navigate } = useAppContext();
            const navItems = [
                { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20}/> },
                { id: 'scanner', label: 'Scan Label', icon: <Camera size={20}/> },
                { id: 'dietPlanner', label: 'Diet Planner', icon: <Utensils size={20}/>, accent: true },
                { id: 'profile', label: 'Health Profile', icon: <UserIcon size={20}/> },
            ];
            return (
                <aside className="hidden lg:flex flex-col w-[260px] flex-shrink-0 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-5 sticky top-24 h-fit backdrop-blur-sm">
                    <div className="mb-8 px-2">
                        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-1">Navigation</h3>
                    </div>
                    <nav className="flex flex-col space-y-2 flex-1">
                        {navItems.map(item => {
                            const isActive = activePage === item.id;
                            return (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate(item.id)}
                                    className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left ${
                                        isActive
                                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]'
                                            : item.accent
                                                ? 'text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/20 border border-transparent'
                                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent'
                                    }`}
                                >
                                    <span className={`transition-colors ${isActive ? 'text-emerald-400' : item.accent ? 'text-amber-400' : 'text-zinc-500 group-hover:text-white'}`}>{item.icon}</span>
                                    <span>{item.label}</span>
                                    {item.accent && !isActive && <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">AI</span>}
                                </motion.button>
                            );
                        })}
                    </nav>
                    <div className="mt-8 p-4 bg-gradient-to-br from-emerald-900/30 to-zinc-900 rounded-xl border border-emerald-500/10">
                        <div className="flex items-center space-x-2 mb-2">
                            <Sparkles size={14} className="text-emerald-400"/>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">Pro Tip</span>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed">Use the AI Diet Planner to generate meals that respect all your allergies & dietary needs.</p>
                    </div>
                </aside>
            );
        };

        // ── Diet Planner Component (Gemini AI) ─────────────────────
        const DietPlanner = () => {
            const { healthProfile, navigate } = useAppContext();
            const [isBodybuilding, setIsBodybuilding] = useState(false);
            const [loading, setLoading] = useState(false);
            const [planHtml, setPlanHtml] = useState('');
            const [error, setError] = useState('');

            const generatePlan = async () => {
                setLoading(true);
                setError('');
                setPlanHtml('');
                try {
                    const res = await fetch(`${BACKEND_URL}/api/diet-plan`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            allergies: healthProfile?.allergies || [],
                            conditions: healthProfile?.medicalConditions || [],
                            diet: healthProfile?.dietaryPreferences || [],
                            is_bodybuilding: isBodybuilding
                        })
                    });
                    const data = await res.json();
                    if (data.success) {
                        const html = window.marked.parse(data.plan_markdown);
                        setPlanHtml(html);
                    } else {
                        setError(data.error || 'Failed to generate diet plan.');
                    }
                } catch (err) {
                    setError('Could not connect to backend. Make sure the Flask server is running.');
                }
                setLoading(false);
            };

            return (
                <div className="flex-1 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white font-['Playfair_Display'] italic">AI Diet Planner</h1>
                            <p className="text-zinc-400 mt-2 text-sm uppercase tracking-widest">Personalized nutrition powered by Gemini</p>
                        </div>
                    </div>

                    {/* Config Card */}
                    <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="bg-zinc-900 rounded-[2rem] p-8 shadow-xl border border-zinc-800">
                        <div className="flex items-center space-x-3 mb-8 border-b border-zinc-800 pb-5">
                            <Utensils className="text-amber-400" size={24}/>
                            <h3 className="font-bold text-xl text-white font-['Playfair_Display'] italic">Configure Your Plan</h3>
                        </div>

                        {/* Active Constraints Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Allergies</div>
                                {healthProfile?.allergies?.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">{healthProfile.allergies.map(a => <span key={a} className="text-[11px] px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-medium">{a}</span>)}</div>
                                ) : <p className="text-zinc-600 text-xs italic">None configured</p>}
                            </div>
                            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Medical Conditions</div>
                                {healthProfile?.medicalConditions?.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">{healthProfile.medicalConditions.map(c => <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 font-medium">{c}</span>)}</div>
                                ) : <p className="text-zinc-600 text-xs italic">None configured</p>}
                            </div>
                            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Dietary Preferences</div>
                                {healthProfile?.dietaryPreferences?.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">{healthProfile.dietaryPreferences.map(d => <span key={d} className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">{d}</span>)}</div>
                                ) : <p className="text-zinc-600 text-xs italic">None configured</p>}
                            </div>
                        </div>

                        {/* Bodybuilding Toggle */}
                        <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50 mb-8">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${isBodybuilding ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                    <Dumbbell size={24}/>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">Bodybuilding Mode</h4>
                                    <p className="text-zinc-500 text-xs mt-0.5">Optimize for high-protein muscle gain</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsBodybuilding(!isBodybuilding)}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${isBodybuilding ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-zinc-700'}`}
                            >
                                <motion.div
                                    layout
                                    className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md ${isBodybuilding ? 'bg-white right-0.5' : 'bg-zinc-400 left-0.5'}`}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    style={{ left: isBodybuilding ? 'auto' : '2px', right: isBodybuilding ? '2px' : 'auto' }}
                                />
                            </button>
                        </div>

                        {/* No profile warning */}
                        {(!healthProfile || (!healthProfile.allergies?.length && !healthProfile.dietaryPreferences?.length && !healthProfile.medicalConditions?.length)) && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 flex items-start space-x-3">
                                <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0"/>
                                <div>
                                    <p className="text-amber-300 text-sm font-bold">No health profile configured</p>
                                    <p className="text-zinc-400 text-xs mt-1">For the best results, <button onClick={() => navigate('profile')} className="text-emerald-400 underline font-bold">set up your health profile</button> first so the AI can account for your allergies and conditions.</p>
                                </div>
                            </div>
                        )}

                        {/* Generate Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={generatePlan}
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 transition-all border focus:outline-none ${
                                loading
                                    ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-600 to-emerald-800 border-emerald-500/50 text-white shadow-[0_0_25px_rgba(4,120,87,0.4)] hover:shadow-[0_0_35px_rgba(4,120,87,0.6)]'
                            }`}
                        >
                            {loading ? (
                                <><div className="w-5 h-5 border-2 border-zinc-600 border-t-emerald-400 rounded-full animate-spin"></div><span>Generating with Gemini AI...</span></>
                            ) : (
                                <><Sparkles size={22}/><span>Generate My Diet Plan</span></>
                            )}
                        </motion.button>
                    </motion.div>

                    {/* Error */}
                    {error && (
                        <motion.div initial={{y:10,opacity:0}} animate={{y:0,opacity:1}} className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-5 flex items-start space-x-3">
                            <AlertTriangle size={20} className="mt-0.5 flex-shrink-0"/>
                            <div><p className="font-bold text-sm">Generation Failed</p><p className="text-xs mt-1 text-zinc-400">{error}</p></div>
                        </motion.div>
                    )}

                    {/* Rendered Diet Plan */}
                    {planHtml && (
                        <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="bg-zinc-900 rounded-[2rem] shadow-xl border border-zinc-800 overflow-hidden">
                            <div className="flex items-center space-x-3 p-6 border-b border-zinc-800">
                                <BookOpen className="text-emerald-400" size={22}/>
                                <h3 className="font-bold text-lg text-white font-['Playfair_Display'] italic">Your Personalized Diet Plan</h3>
                                {isBodybuilding && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ml-auto flex items-center space-x-1"><Dumbbell size={10}/><span>Bodybuilding</span></span>}
                            </div>
                            <div
                                className="p-6 md:p-8 diet-plan-content prose prose-invert prose-emerald max-w-none text-zinc-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: planHtml }}
                            />
                        </motion.div>
                    )}
                </div>
            );
        };

        // ── Dashboard Component ─────────────────────────────────
        const Dashboard = () => {
            const { user, healthProfile, navigate } = useAppContext();
            const recentScans = [
                {id:1,name:'Kurkure Masala Munch',date:'Today, 2:30 PM',risk:'High Risk',match:'Milk Solids, Garlic',icon:'🟠',color:'text-brand-coral',bg:'bg-brand-coral/10'},
                {id:2,name:'Cadbury Dairy Milk',date:'Yesterday',risk:'Caution',match:'Milk, Soya',icon:'🍫',color:'text-brand-yellow',bg:'bg-yellow-100'},
                {id:3,name:'Glucon-D Instant Energy',date:'Apr 6',risk:'Safe',match:'None',icon:'⚡',color:'text-brand-green',bg:'bg-brand-green/10'},
            ];
            return (
                <div className="min-h-[calc(100vh-4rem)] bg-black py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex gap-8">
                        <Sidebar activePage="dashboard"/>
                        <div className="flex-1 space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-zinc-900 rounded-[2rem] shadow-sm border border-zinc-800">
                            <div className="flex items-center space-x-4">
                                {user?.photo ? <img src={user.photo} alt="" className="w-16 h-16 rounded-full border-2 border-emerald-500/50 shadow-lg"/> : <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700 text-zinc-500"><UserIcon size={24}/></div>}
                                <div><h1 className="text-3xl font-display font-bold text-white font-['Playfair_Display'] italic">Hello, {user?.name||'User'}</h1><p className="text-zinc-400 mt-1 font-medium font-['Inter']">Ready to scan your next product?</p></div>
                            </div>
                            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>navigate('scanner')} className="mt-6 md:mt-0 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(4,120,87,0.4)] flex items-center space-x-3 w-full md:w-auto justify-center border border-emerald-500/50 focus:outline-none"><Camera size={24}/><span>Scan New Label</span></motion.button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="space-y-8">
                                <div className="bg-zinc-900 rounded-[2rem] p-6 shadow-xl border border-zinc-800">
                                    <div className="flex items-center space-x-2 mb-6 text-white border-b border-zinc-800 pb-4"><AlertTriangle className="text-red-400" size={20}/><h3 className="font-bold text-lg font-['Playfair_Display'] italic">Active Safety Filters</h3></div>
                                    {healthProfile?.allergies?.length>0?(<div className="flex flex-wrap gap-2">{healthProfile.allergies.map(a=>(<span key={a} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-lg flex items-center shadow-sm"><XIcon size={14} className="mr-1"/>{a}</span>))}</div>):(<div className="text-center py-6 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50"><ShieldCheck className="mx-auto h-8 w-8 text-zinc-600 mb-2"/><p className="text-sm text-zinc-500">No allergies configured.</p><button onClick={()=>navigate('profile')} className="text-emerald-400 text-sm font-bold mt-2 hover:underline">Edit Profile</button></div>)}
                                </div>
                                <div className="bg-zinc-900 rounded-[2rem] p-6 shadow-xl border border-zinc-800">
                                    <h3 className="font-bold text-lg mb-6 border-b border-zinc-800 pb-4 flex items-center text-white font-['Playfair_Display'] italic"><Activity className="text-emerald-400 mr-2" size={20}/>Dietary Preferences</h3>
                                    {healthProfile?.dietaryPreferences?.length>0?(<div className="flex flex-col space-y-3">{healthProfile.dietaryPreferences.map(d=>(<div key={d} className="flex items-center space-x-3"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div><span className="text-zinc-300 font-medium">{d}</span></div>))}</div>):(<p className="text-sm text-zinc-500 text-center py-4">No specific diets set.</p>)}
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-zinc-900 rounded-[2rem] p-6 md:p-8 shadow-xl border border-zinc-800">
                                <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4"><h3 className="font-bold text-xl text-white font-['Playfair_Display'] italic">Recent Scans</h3></div>
                                <div className="space-y-4">{recentScans.map((scan,i)=>(
                                    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} key={scan.id} onClick={()=>navigate('results')} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-zinc-800 hover:border-zinc-600 hover:shadow-lg transition-all cursor-pointer bg-zinc-950/50 hover:bg-zinc-800">
                                        <div className="flex items-center space-x-4 mb-3 sm:mb-0"><div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all bg-zinc-800 border border-zinc-700`}>{scan.icon}</div><div><h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{scan.name}</h4><p className="text-xs text-zinc-500 font-medium mt-1">{scan.date}</p></div></div>
                                        <div className="flex items-center space-x-4 sm:space-x-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-zinc-800 pt-3 sm:pt-0">
                                            <div className="text-left sm:text-right"><div className={`text-xs font-bold uppercase tracking-wider ${scan.color}`}>{scan.risk}</div><div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">{scan.match==='None'?'Clear':`Match: ${scan.match}`}</div></div>
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-sm"><ChevronRight size={18}/></div>
                                        </div>
                                    </motion.div>
                                ))}</div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            );
        };

        // ── Results Component (Real Data) ───────────────────────
        const Results = () => {
            const { navigate, scanResult } = useAppContext();

            // Fallback mock data if no real scan
            const analysis = scanResult?.analysis || {
                overall_risk:'Potential Risk', risk_color:'yellow', summary:'Demo result — scan a real label for live analysis.',
                flagged_ingredients:[{ingredient:'Milk Solids',allergen_category:'Milk',risk:'Potential Risk',reason:'Contains dairy'},{ingredient:'Wheat Flour',allergen_category:'Wheat / Gluten',risk:'Potential Risk',reason:'Contains gluten'}],
                allergen_matches:['Milk','Wheat / Gluten'], dietary_concerns:[], condition_concerns:[], db_allergens:[]
            };
            const ocrData = scanResult?.ocr || { ingredients_text:'REFINED WHEAT FLOUR (MAIDA), SUGAR, MILK SOLIDS, EDIBLE VEGETABLE OIL', ingredients_list:['Refined Wheat Flour','Sugar','Milk Solids','Edible Vegetable Oil'] };
            const productName = analysis.matched_product?.name || 'Scanned Product';

            const riskColors = { 'Unsafe':'text-red-400', 'Potential Risk':'text-amber-400', 'Safe':'text-emerald-400', 'Unknown':'text-zinc-400' };
            const riskBg = { 'Unsafe':'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]', 'Potential Risk':'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]', 'Safe':'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]', 'Unknown':'bg-zinc-800 border-zinc-700 text-zinc-400' };
            const riskIcon = analysis.overall_risk === 'Unsafe' ? <AlertTriangle size={28}/> : analysis.overall_risk === 'Safe' ? <CheckCircle size={28}/> : <Info size={28}/>;

            return (
                <div className="min-h-[calc(100vh-4rem)] bg-black py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]"></div>
                    <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <button onClick={()=>navigate('dashboard')} className="text-zinc-500 font-medium hover:text-white flex items-center mb-4 transition-colors"><ChevronRight className="transform rotate-180 mr-1" size={16}/> Back to Dashboard</button>
                                <h1 className="text-4xl font-display font-bold text-white font-['Playfair_Display'] italic">{productName}</h1>
                                <p className="text-zinc-400 mt-2 text-sm uppercase tracking-widest">{analysis.matched_product ? 'Matched in product database' : 'Scanned via OCR'}</p>
                            </div>
                            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",stiffness:200,damping:15}}
                                className={`mt-6 md:mt-0 ${riskBg[analysis.overall_risk]||riskBg['Unknown']} border backdrop-blur-md px-6 py-4 rounded-2xl flex items-center space-x-4`}>
                                {riskIcon}
                                <div><div className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-0.5">{analysis.overall_risk==='Unsafe'?'Warning':analysis.overall_risk==='Safe'?'All Clear':'Caution'}</div><div className="text-xl font-black">{analysis.overall_risk?.toUpperCase()}</div></div>
                            </motion.div>
                        </div>

                        {/* Summary */}
                        <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="bg-zinc-900 rounded-[2rem] p-8 shadow-xl border border-zinc-800">
                            <p className="text-zinc-300 font-medium text-lg leading-relaxed font-['Inter']">{analysis.summary}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Flagged Ingredients */}
                            <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}} className="bg-zinc-900 rounded-[2rem] p-6 md:p-8 shadow-xl border border-zinc-800">
                                <div className="flex items-center space-x-3 mb-6 border-b border-zinc-800 pb-4"><ShieldCheck className="text-red-400" size={24}/><h3 className="font-bold text-xl text-white font-['Playfair_Display'] italic">Flagged Items ({analysis.flagged_ingredients?.length || 0})</h3></div>
                                {analysis.flagged_ingredients?.length > 0 ? (
                                    <div className="space-y-4">{analysis.flagged_ingredients.map((f,i)=>(
                                        <div key={i} className={`rounded-xl p-4 border flex items-start space-x-4 ${f.risk==='Unsafe'?'bg-red-500/10 border-red-500/30':'bg-amber-500/10 border-amber-500/30'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${f.risk==='Unsafe'?'bg-red-500/20 text-red-400 border-red-500/50':'bg-amber-500/20 text-amber-400 border-amber-500/50'}`}>{f.risk==='Unsafe'?<AlertTriangle size={16}/>:<Info size={16}/>}</div>
                                            <div><div className="font-bold text-white text-sm tracking-wide">{f.ingredient}</div><div className="text-xs text-zinc-400 mt-1 leading-snug">{f.reason}</div><div className={`text-[10px] font-bold uppercase mt-2 tracking-wider ${f.risk==='Unsafe'?'text-red-400':'text-amber-400'}`}>{f.risk}</div></div>
                                        </div>
                                    ))}</div>
                                ) : (<div className="text-center py-10 bg-zinc-800/30 rounded-xl border border-zinc-800 border-dashed"><CheckCircle className="mx-auto text-emerald-400 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.3)] rounded-full" size={48}/><p className="text-zinc-400 font-medium">No flagged ingredients!</p></div>)}
                            </motion.div>

                            {/* OCR Extracted Text */}
                            <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.2}} className="bg-zinc-900 rounded-[2rem] p-6 md:p-8 shadow-xl border border-zinc-800 flex flex-col">
                                <div className="flex items-center space-x-3 mb-6 border-b border-zinc-800 pb-4"><Eye className="text-emerald-400" size={24}/><h3 className="font-bold text-xl text-white font-['Playfair_Display'] italic">Analysis Raw Data</h3></div>
                                
                                <div className="flex-1">
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-3">Extracted Text</h4>
                                    <div className="text-emerald-400/80 leading-relaxed p-4 bg-black rounded-xl border border-zinc-800 text-xs font-mono mb-8 max-h-40 overflow-y-auto shadow-inner">{ocrData.ingredients_text || 'No text extracted'}</div>

                                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-3">Parsed Ingredients ({ocrData.ingredients_list?.length || 0})</h4>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {(ocrData.ingredients_list||[]).map((ing,i)=>{
                                            const isFlagged = analysis.flagged_ingredients?.some(f=>ing.toLowerCase().includes(f.ingredient.toLowerCase())||f.ingredient.toLowerCase().includes(ing.toLowerCase()));
                                            return <span key={i} className={`text-[11px] px-3 py-1.5 rounded-full font-medium tracking-wide ${isFlagged?'bg-red-500/20 text-red-300 border border-red-500/30':'bg-zinc-800 text-zinc-300 border border-zinc-700'}`}>{ing}</span>;
                                        })}
                                    </div>

                                    {(analysis.dietary_concerns?.length>0||analysis.condition_concerns?.length>0)&&(
                                        <div className="mt-auto pt-6 border-t border-zinc-800">
                                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-4">Additional Health Concerns</h4>
                                            {analysis.dietary_concerns?.map((c,i)=>(<div key={'d'+i} className="text-sm text-amber-500 border-l-2 border-amber-500 pl-3 mb-3">{c.reason}</div>))}
                                            {analysis.condition_concerns?.map((c,i)=>(<div key={'c'+i} className="text-sm text-purple-400 border-l-2 border-purple-400 pl-3 mb-3">{c.reason}</div>))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        <div className="flex justify-center flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
                            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>navigate('scanner')} className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white border border-emerald-500/50 px-10 py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(4,120,87,0.4)] flex items-center justify-center space-x-3 w-full sm:w-auto"><Camera size={20}/><span>Scan Another</span></motion.button>
                            <button onClick={()=>navigate('dashboard')} className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-10 py-4 rounded-2xl font-semibold hover:bg-zinc-800 hover:text-white transition-all w-full sm:w-auto shadow-md">Dashboard</button>
                        </div>
                    </div>
                </div>
            );
        };

        // ── Main App ────────────────────────────────────────────
        const App = () => {
            const { currentPage, authLoading } = useAppContext();

            if (authLoading) {
                return (<div className="min-h-screen flex items-center justify-center bg-black"><div className="text-center"><div className="w-12 h-12 border-4 border-zinc-800 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div><p className="text-zinc-500 font-medium">Loading...</p></div></div>);
            }

            return (
                <div className="min-h-screen flex flex-col font-sans relative bg-black text-white">
                    <Navbar />
                    <main className="flex-1 relative z-10 w-full">
                        <AnimatePresence mode="wait">
                            <motion.div key={currentPage} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.3,ease:"easeOut"}} className="w-full h-full">
                                {currentPage==='landing'&&<Landing/>}
                                {currentPage==='auth'&&<Auth/>}
                                {currentPage==='profile'&&<Profile/>}
                                {currentPage==='dashboard'&&<Dashboard/>}
                                {currentPage==='scanner'&&<Scanner/>}
                                {currentPage==='results'&&<Results/>}
                                {currentPage==='dietPlanner'&&(
                                    <div className="min-h-[calc(100vh-4rem)] bg-black py-8 px-4 sm:px-6 lg:px-8">
                                        <div className="max-w-7xl mx-auto flex gap-8">
                                            <Sidebar activePage="dietPlanner"/>
                                            <DietPlanner/>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            );
        };

        // Render
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<AppProvider><App/></AppProvider>);
