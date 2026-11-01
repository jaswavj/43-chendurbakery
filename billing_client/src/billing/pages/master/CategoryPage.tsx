import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { masterApi, masterError, masterPage } from '../../../api/master/master-api-service';
import ListPagination, { DEFAULT_PAGE_SIZE } from '../../components/ListPagination';
import { useHeadings } from './useHeadings';
import './Master.css';

type Row = { id: number; name: string; discType?: number; discount?: number };

const CategoryPage: React.FC = () => {
  const heads = useHeadings();
  const title = heads.head1 || 'Category';
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [name, setName] = useState('');
  const [discType, setDiscType] = useState('0');
  const [discount, setDiscount] = useState('0.00');
  const [editId, setEditId] = useState(0);
  const [blockIt, setBlockIt] = useState(false);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = async (p = page, q = search) => {
    try {
      const pg = masterPage<Row>(await masterApi.categories(p, DEFAULT_PAGE_SIZE, q.trim() || undefined));
      setRows(pg.items);
      setTotal(pg.total);
    } catch (err) {
      toast.error(masterError(err, 'Could not load list'));
    }
  };

  useEffect(() => {
    setPage(0);
  }, [search]);

  useEffect(() => {
    refresh(page, search);
  }, [page, search]);

  const reset = () => {
    setName('');
    setDiscType('0');
    setDiscount('0.00');
    setEditId(0);
    setBlockIt(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning(`${title} name is required`);
      return;
    }
    setBusy(true);
    try {
      if (editId && blockIt) {
        await masterApi.blockCategory(editId);
        toast.info(`${title} blocked successfully`);
      } else {
        await masterApi.saveCategory({
          id: editId || undefined,
          name: name.trim(),
          discType: Number(discType),
          discount: discType === '0' ? 0 : Number(discount || 0),
        });
        toast.success(editId ? `${title} updated successfully` : `${title} added successfully`);
      }
      reset();
      await refresh(page, search);
    } catch (err) {
      toast.error(masterError(err, 'Save failed'));
    } finally {
      setBusy(false);
    }
  };

  const discLabel = (row: Row) => {
    if (row.discType === 1) return `${Number(row.discount || 0)} Rs`;
    if (row.discType === 2) return `${Number(row.discount || 0)} %`;
    return 'No Discount';
  };

  return (
    <div className="mst-page">
      <h2 className="mst-title">
        <i className="fas fa-layer-group" /> {title}
      </h2>
      <div className="mst-grid">
        <div className="mst-card">
          <div className="mst-card-h">
            <span>
              <i className="fas fa-plus-circle" /> {editId ? `Edit ${title}` : `Add New ${title}`}
            </span>
          </div>
          <form className="mst-card-b mst-form one-col" onSubmit={onSubmit}>
            <div className="mst-fg">
              <label>
                {title} Name <span className="req">*</span>
              </label>
              <input className="mst-inp" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div className="mst-fg">
              <label>Discount Type</label>
              <select
                className="mst-sel"
                value={discType}
                onChange={(e) => {
                  setDiscType(e.target.value);
                  if (e.target.value === '0') setDiscount('0.00');
                }}
              >
                <option value="0">Select Type</option>
                <option value="1">Rs</option>
                <option value="2">%</option>
              </select>
            </div>
            <div className="mst-fg">
              <label>Discount</label>
              <input
                className="mst-inp"
                type="number"
                step="0.01"
                readOnly={discType === '0'}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            {editId > 0 && (
              <label className="mst-block mst-check">
                <input type="checkbox" checked={blockIt} onChange={(e) => setBlockIt(e.target.checked)} />
                Block this {title.toLowerCase()}
              </label>
            )}
            <div className="mst-actions">
              <button className="mst-btn mst-btn-primary" disabled={busy} type="submit">
                <i className="fas fa-save" /> {editId ? 'Update' : `Add ${title}`}
              </button>
              {editId > 0 && (
                <button className="mst-btn mst-btn-outline" type="button" onClick={reset}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="mst-card">
          <div className="mst-card-h">
            <span>
              <i className="fas fa-list" /> {title} List
            </span>
            <div className="mst-search">
              <i className="fas fa-search" />
              <input className="mst-inp" placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="mst-table-wrap">
            <table className="mst-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Name</th>
                  <th style={{ width: 140 }}>Discount</th>
                  <th style={{ width: 80 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="mst-empty">
                      No records
                    </td>
                  </tr>
                )}
                {rows.map((row, i) => (
                  <tr key={row.id}>
                    <td>{page * DEFAULT_PAGE_SIZE + i + 1}</td>
                    <td>{row.name}</td>
                    <td>{discLabel(row)}</td>
                    <td>
                      <button
                        className="mst-icon-btn"
                        type="button"
                        title="Edit"
                        onClick={() => {
                          setEditId(row.id);
                          setName(row.name);
                          setDiscType(String(row.discType ?? 0));
                          setDiscount(String(row.discount ?? 0));
                          setBlockIt(false);
                        }}
                      >
                        <i className="fas fa-edit" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ListPagination page={page} size={DEFAULT_PAGE_SIZE} total={total} onChange={setPage} />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
