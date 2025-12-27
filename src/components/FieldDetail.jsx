import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const FieldDetail = ({ refreshParentFields, currentDate }) => {
    const { fieldId } = useParams();
    const navigate = useNavigate();

    const [field, setField] = useState(null);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newItemLabel, setNewItemLabel] = useState('');
    const [newItemAmount, setNewItemAmount] = useState('');

    useEffect(() => {
        fetchData();
    }, [fieldId, currentDate]);

    const fetchData = async () => {
        try {
            const { data: fieldData, error: fieldError } = await supabase
                .from('user_fields')
                .select('*')
                .eq('id', fieldId)
                .single();

            if (fieldError) throw fieldError;
            setField(fieldData);

            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

            const { data: entriesData, error: entriesError } = await supabase
                .from('field_entries')
                .select('*')
                .eq('field_id', fieldId)
                .gte('created_at', startOfMonth)
                .lte('created_at', endOfMonth)
                .order('created_at', { ascending: true });

            if (entriesError) throw entriesError;
            setEntries(entriesData || []);
        } catch (err) {
            console.error('Error fetching details:', err);
        } finally {
            setLoading(false);
        }
    };

    const addEntry = async () => {
        if (!newItemLabel || !newItemAmount) return;
        const amount = parseFloat(newItemAmount);

        let entryDate = new Date();
        if (entryDate.getMonth() !== currentDate.getMonth() || entryDate.getFullYear() !== currentDate.getFullYear()) {
            entryDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        }

        const { data, error } = await supabase
            .from('field_entries')
            .insert([{
                field_id: fieldId,
                label: newItemLabel,
                amount: amount,
                created_at: entryDate.toISOString()
            }])
            .select();

        if (error) {
            console.error('Error adding entry:', error);
        } else {
            setEntries([...entries, ...data]);
            setNewItemLabel('');
            setNewItemAmount('');
            refreshParentFields();
        }
    };

    const removeEntry = async (entryId) => {
        const { error } = await supabase
            .from('field_entries')
            .delete()
            .eq('id', entryId);

        if (error) {
            console.error('Error deleting entry:', error);
        } else {
            setEntries(entries.filter(e => e.id !== entryId));
            refreshParentFields();
        }
    };

    const formatCurrency = (val) => {
        return val.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('₹', 'Rs ');
    };

    if (loading) return <div>Loading...</div>;
    if (!field) return <div>Field not found</div>;

    const total = entries.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7, marginBottom: '1rem' }}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--ink-blue)', paddingBottom: '0.5rem' }}>
                    <h2 style={{ margin: 0, lineHeight: 1 }}>{field.label}</h2>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: field.type === 'money_out' ? '#d32f2f' : '#2e7d32', lineHeight: 1 }}>
                        {formatCurrency(total)}
                    </div>
                </div>
            </div>

            <div className="entries-list">
                {entries.length === 0 && <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Empty for this month.</p>}

                {entries.map(entry => (
                    <div key={entry.id} className="field-row detail-row">
                        <span className="row-label">{entry.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className="handwritten-value">
                                {formatCurrency(entry.amount)}
                            </span>
                            <button onClick={() => removeEntry(entry.id)} className="delete-btn">
                                <Trash2 size={14} className="text-red" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="field-row input-row" style={{ marginTop: '2rem', borderTop: '2px dashed var(--pencil-gray)', paddingTop: '1rem' }}>
                <input
                    placeholder="Item (e.g. Taxi)"
                    value={newItemLabel}
                    onChange={(e) => setNewItemLabel(e.target.value)}
                    style={{ flex: 1, borderBottom: '1px dashed #999' }}
                    autoFocus
                />
                <input
                    type="number"
                    placeholder="0"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    style={{ width: '80px', textAlign: 'right', borderBottom: '1px dashed #999' }}
                />
                <button onClick={addEntry} disabled={!newItemLabel || !newItemAmount} style={{ marginLeft: '1rem' }}>
                    <Plus size={24} className="text-green" />
                </button>
            </div>

            <style>{`
        .detail-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px dotted var(--line-color);
            padding: 0.5rem 0;
        }
        .row-label {
            font-weight: 600;
        }
        .text-red { color: #d32f2f; }
        .text-green { color: #2e7d32; }
        .input-row { display: flex; align-items: center; gap: 1rem; }
      `}</style>
        </div>
    );
};

export default FieldDetail;
