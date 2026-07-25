import DataTable from '../../components/ui/DataTable';
import CrudForm from '../../components/ui/CrudForm';
import { useFetch } from '../../hooks/useFetch';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../../api/branches';

const columns = [
  { key: 'name', label: 'Nomi' },
  { key: 'location', label: 'Lokatsiya' },
];

const fields = [
  { key: 'name', label: 'Filial nomi', required: true },
  { key: 'location', label: 'Manzil (Google Maps uchun)', required: true, placeholder: 'Masalan: Toshkent, Chilonzor, Bunyodkor ko\'chasi 1' },
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
      searchFields={['name', 'location']}
      renderForm={(editing, onClose) => (
        <CrudForm
          fields={fields}
          initialData={editing}
          onSubmit={async (id, form) => {
            if (editing) {
              await updateBranch(id, form);
            } else {
              await createBranch(form);
            }
            refetch();
          }}
          onClose={onClose}
        />
      )}
    />
  );
}