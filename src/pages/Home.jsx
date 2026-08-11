import { useEffect, useState } from "react";
import { Grid, GridCell, GridSpan6 } from "../grid";
import { getGroupChannels, useArenaRefresh } from "../arena";

function Home() {
  const refreshKey = useArenaRefresh();
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const skipCache = refreshKey > 0;
    getGroupChannels(undefined, { skipCache }).then(setChannels);
  }, [refreshKey]);

  return (
    <Grid>
      <GridCell $span={12}>
        <h1>Are.na Channels</h1>
      </GridCell>
      {channels.map((ch) => (
        <GridSpan6 key={ch.id}>
          <h2>{ch.title}</h2>
        </GridSpan6>
      ))}
    </Grid>
  );
}

export default Home;
