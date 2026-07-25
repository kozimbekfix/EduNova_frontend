import DataTable from '../../components/ui/DataTable';
import CrudForm from '../../components/ui/CrudForm';
import { useFetch } from '../../hooks/useFetch';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../../api/branches';

const columns = [
  { key: 'name', label: 'Nomi' },
  { key: 'address', label: 'Manzil' },
  { key: 'phone', label: 'Telefon' },
];

const fields = [
  { key: 'name', label: 'Filial nomi', required: true },
  { key: 'address', label: 'Manzil' },
  { key: 'phone', label: 'Telefon' },
  { key: 'workHours', label: 'Ish vaqti' },
];

export default function AdminBranches() {
  const { data, loading, error, refetch } = useFetch(getBranches);

  return (
    <DataTable
      title="Filiallar"
      data={data || []}
      loading={loading}
      error={error}
      columns={columns}
      searchFields={['name', 'address']}
      onAdd={async (_, form) => { await createBranch(form); refetch(); }}
      onEdit={async (id, form) => { await updateBranch(id, form); refetch(); }}
      onDelete={async (id) => { await deleteBranch(id); refetch(); }}
      renderForm={(editing, onClose) => (
        <CrudForm fields={fields} initialData={editing} onSubmit={editing ? updateBranch : createBranch} onClose={onClose} />
      )}
    />
  );
}
