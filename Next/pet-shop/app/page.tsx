type Props = {
  title: string;
}

export default function Home() {

  const Component = ({ title }: Props) => {
    console.log(title);

    return (
      <>
        <h2>Component</h2>
      </>
    )
  }

  return (
    <div>
      <h2>Title</h2>

      <Component title={100} />
    </div>
  );
}
