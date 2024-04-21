import Head from "next/head";
import { Inter } from "next/font/google";
import Table from "react-bootstrap/Table";
import { Alert, Container, Pagination, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

const inter = Inter({ subsets: ["latin"] });

type TUserItem = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  updatedAt: string;
};

type TGetServerSideProps = {
  statusCode: number;
  paginatedUsers: TUserItem[];
  totalUsers?: number;
};

export const getServerSideProps: GetServerSideProps<TGetServerSideProps> = async ({ query }: GetServerSidePropsContext) => {
  const page = query.page ? parseInt(query.page as string) : 1;
  const limit = query.limit ? parseInt(query.limit as string) : 20; // Количество записей на странице, по умолчанию 20
  try {
    const res = await fetch(`http://localhost:3000/users?page=${page}&limit=${limit}`, { method: 'GET' });
    if (!res.ok) {
      return { props: { statusCode: res.status, paginatedUsers: [] } };
    }

    const { users, totalUsers } = await res.json();

    return { props: { statusCode: 200, paginatedUsers: users, totalUsers } };
  } catch (e) {
    return { props: { statusCode: 500, paginatedUsers: [] } };
  }
};

const PAGE_BLOCK_SIZE = 10; 

export default function Home({ statusCode, paginatedUsers, totalUsers }: TGetServerSideProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const limit = 20;

  useEffect(() => {
    router.push(`/?page=${currentPage}&limit=${20}`);
  }, [currentPage]);


  if (statusCode !== 200) {
    return <Alert variant={'danger'}>Ошибка {statusCode} при загрузке данных</Alert>;
  }

  const totalPages = paginatedUsers.length > 0 && totalUsers ? Math.ceil(totalUsers / 20) : 0; // Общее количество страниц

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = async (page: number, limit: number) => {
    setLoading(true);
    setCurrentPage(page);
    setLoading(false);
  };

  const handlePrevBlock = () => {
    const newPage = Math.max(1, currentPage - PAGE_BLOCK_SIZE);
    setCurrentPage(newPage);
  };

  const handleNextBlock = () => {
    const newPage = Math.min(currentPage + PAGE_BLOCK_SIZE, totalPages);
    setCurrentPage(newPage);
  };

  // Вычисляем диапазон страниц в блоке
  const startBlock = Math.floor((currentPage - 1) / PAGE_BLOCK_SIZE) * PAGE_BLOCK_SIZE + 1;
  const endBlock = Math.min(startBlock + PAGE_BLOCK_SIZE - 1, totalPages);

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={'mb-5'}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Дата обновления</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination>
            <Pagination.First onClick={handlePrevBlock} disabled={startBlock === 1 || loading} />
            <Pagination.Prev onClick={handlePrevPage} disabled={currentPage === 1 || loading} />
            {Array.from({ length: endBlock - startBlock + 1 }, (_, index) => index + startBlock).map((page) => (
              <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageClick(page, limit)} disabled={loading}>
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={handleNextPage} disabled={currentPage === totalPages || loading} />
            <Pagination.Last onClick={handleNextBlock} disabled={endBlock === totalPages || loading} />
          </Pagination>

          {loading && <Spinner animation="border" />}
        </Container>
      </main>
    </>
  );
}

