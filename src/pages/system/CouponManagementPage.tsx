import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Ticket, 
    Plus, 
    Calendar, 
    Users, 
    Percent,
    DollarSign
} from 'lucide-react';
import { systemAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

export default function CouponManagementPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        expiryDate: '',
        maxUsage: 100,
        applicablePlans: [] as string[]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const couponRes = await systemAPI.getCoupons();
            setCoupons(couponRes.data.data);
        } catch (error) {
            toast.error('Failed to load coupon data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await systemAPI.createCoupon(formData);
            toast.success('Coupon created successfully');
            setShowModal(false);
            loadData();
        } catch (error) {
            toast.error('Failed to create coupon');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Ticket className="w-8 h-8 text-orange-500" />
                        Campaign & Coupons
                    </h1>
                    <p className="text-slate-500">Manage promotional codes and SaaS discounts.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="gap-2 bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4" />
                    New Coupon
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center italic text-slate-500">Retrieving campaigns...</div>
                ) : coupons.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="font-medium text-slate-600">No active coupons</p>
                        <Button variant="link" onClick={() => setShowModal(true)}>Create your first promo code</Button>
                    </div>
                ) : (
                    coupons.map((coupon) => (
                        <Card key={coupon._id} className="relative overflow-hidden group border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all">
                            <div className="absolute top-0 right-0 p-4">
                                <Badge variant={coupon.isActive ? "default" : "secondary"}>
                                    {coupon.isActive ? "Active" : "Expired"}
                                </Badge>
                            </div>
                            <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
                                <CardTitle className="font-mono text-2xl tracking-tighter text-orange-600">{coupon.code}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    {coupon.discountType === 'percentage' ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                                    {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' OFF'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-400 font-bold uppercase">Usage</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            {coupon.currentUsage} / {coupon.maxUsage}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-400 font-bold uppercase">Expires</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Applicable Plans</p>
                                    <div className="flex flex-wrap gap-1">
                                        {coupon.applicablePlans.length === 0 ? (
                                            <Badge variant="outline" className="text-[10px]">All Plans</Badge>
                                        ) : (
                                            coupon.applicablePlans.map((p: any) => (
                                                <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg shadow-2xl border-none animate-in zoom-in-95 duration-200">
                        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                            <CardTitle>Create Promotional Coupon</CardTitle>
                            <CardDescription className="text-slate-400">Set validation rules and discount values.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">Coupon Code</label>
                                        <input 
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-mono uppercase tracking-widest outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="SUMMER2024"
                                            value={formData.code}
                                            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">Discount Type</label>
                                        <select 
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none"
                                            value={formData.discountType}
                                            onChange={(e) => setFormData({...formData, discountType: e.target.value as any})}
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount ($)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">Value</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">Expiry Date</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">Max Usage</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none"
                                            value={formData.maxUsage}
                                            onChange={(e) => setFormData({...formData, maxUsage: Number(e.target.value)})}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <div className="p-6 pt-0 flex gap-3">
                                <Button variant="outline" type="button" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white" type="submit">Deploy Coupon</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
